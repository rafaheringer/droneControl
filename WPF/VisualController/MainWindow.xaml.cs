using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Threading;
using MahApps.Metro.Controls;
using MyoSharp.Communication;
using MyoSharp.Device;
using MyoSharp.Exceptions;

namespace SerialDataReceiver
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : MetroWindow
    {
        #region variables
        //Richtextbox
        private FlowDocument flowDocument { get; set; }
        private FlowDocument flowDocumentMyo { get; set; }
        private Paragraph paragraph { get; set; }
        private Paragraph paragraphMyo { get; set; }

        //Control variables
        private const int PPMMin = 1000;    //Min rotation (1000)
        private const int PPMMax = 2000;    //Max rotation (2000)
        private const int PPMMid = 1500;
        public int PPMThrottle { get; set; }
        public int PPMAileron { get; set; }
        public int PPMElevator { get; set; }
        public int PPMRudder { get; set; }

        //Serial control
        private string serialPortName;
        private Services.SerialCommService serialCommService { get; set; }
        #endregion

        public MainWindow()
        {
            //Variables
            flowDocument = new FlowDocument();
            flowDocumentMyo = new FlowDocument();
            paragraph = new Paragraph();
            paragraphMyo = new Paragraph();

            PPMThrottle = PPMMin;
            PPMAileron = PPMMid;
            PPMElevator = PPMMid;
            PPMRudder = PPMMid;

            serialCommService = new Services.SerialCommService();

            //Components
            InitializeComponent();

            //Overwite to ensure state
            connectBtn.Content = "Connect";

            //Get all connected serial ports
            IEnumerable<string> serialPorts = Services.SerialCommService.GetOpenedSerialComms();
            commPortNames.ItemsSource = serialPorts;
            commPortNames.SelectedIndex = 0;

            //Keydown bindings
            this.KeyDown += new KeyEventHandler(OnButtonKeyDown);
            this.KeyUp += new KeyEventHandler(OnButtonKeyUp);

            //Create a hub that will manage Myo devices for us
            using (var channel = Channel.Create(ChannelDriver.Create(ChannelBridge.Create(), MyoErrorHandlerDriver.Create(MyoErrorHandlerBridge.Create()))))
            using (var hub = Hub.Create(channel))
            {
                // listen for when the Myo connects
                hub.MyoConnected += (sender, e) =>
                {
                    Myo_SendToDebug(String.Format("Myo {0} has connected!", e.Myo.Handle));
                    e.Myo.Vibrate(VibrationType.Short);
                    e.Myo.PoseChanged += Myo_PoseChanged;
                    e.Myo.Locked += Myo_Locked;
                    e.Myo.Unlocked += Myo_Unlocked;
                };

                // listen for when the Myo disconnects
                hub.MyoDisconnected += (sender, e) =>
                {
                    Myo_SendToDebug(String.Format("Oh no! It looks like {0} arm Myo has disconnected!", e.Myo.Arm));
                    e.Myo.PoseChanged -= Myo_PoseChanged;
                    e.Myo.Locked -= Myo_Locked;
                    e.Myo.Unlocked -= Myo_Unlocked;
                };

                // start listening for Myo data
                channel.StartListening();

                // wait on user input
                Myo_UserInputLoop(hub);
            }
        }

        private void OnButtonKeyDown(object sender, KeyEventArgs e)
        {
            e.Handled = true;

            switch (e.Key)
            {
                case Key.Up:
                    ThrottleUp(50);

                    break;
                case Key.Down:
                    ThrottleDown(50);
                    break;
                case Key.Left:

                    break;
                case Key.Right:

                    break;
                case Key.W:
                    RudderFoward();
                    break;
                case Key.S:
                    RudderBackward();
                    break;
                case Key.A:
                    AileronLeft();
                    break;
                case Key.D:
                    AileronRight();
                    break;
            }
        }

        private void OnButtonKeyUp(object sender, KeyEventArgs e)
        {
            switch (e.Key)
            {
                case Key.Up:
                    break;
                case Key.Down:
                    break;
                case Key.Left:
                    break;
                case Key.Right:
                    break;
                case Key.W:
                case Key.S:
                    RudderCenter();
                    break;
                case Key.A:
                case Key.D:
                    AileronCenter();
                    break;
            }
        }

        public void ConnectToComms(object sender, RoutedEventArgs e)
        {
            serialPortName = commPortNames.Text;


            if (serialCommService.Connect(serialPortName))
            {
                //Sets button state
                connectBtn.Content = "Disconnect";

                //Data received callback
                serialCommService.AttachDataReceivedCallback(new System.IO.Ports.SerialDataReceivedEventHandler(Receive));

            }
            else
            {
                serialCommService.Disconnect();
                connectBtn.Content = "Connect";
            }
        }

        #region Myo Event Handlers
        private void Myo_UserInputLoop(IHub hub) {
            string userInput;
            while (!string.IsNullOrEmpty((userInput = Console.ReadLine())))
            {
                if (userInput.Equals("pose", StringComparison.OrdinalIgnoreCase))
                {
                    foreach (var myo in hub.Myos)
                    {
                        Myo_SendToDebug(String.Format("Myo {0} in pose {1}.", myo.Handle, myo.Pose));
                    }
                }
                else if (userInput.Equals("arm", StringComparison.OrdinalIgnoreCase))
                {
                    foreach (var myo in hub.Myos)
                    {
                        Myo_SendToDebug(String.Format("Myo {0} is on {1} arm.", myo.Handle, myo.Arm.ToString().ToLower()));
                    }
                }
                else if (userInput.Equals("count", StringComparison.OrdinalIgnoreCase))
                {
                    Myo_SendToDebug(String.Format("There are {0} Myo(s) connected.", hub.Myos.Count));
                }
            }
        } 

        private void Myo_SendToDebug(string text)
        {
            paragraphMyo.Inlines.Add(text);
            flowDocumentMyo.Blocks.Add(paragraphMyo);
            myoDataRichTextBox.Document = flowDocumentMyo;
        } 

        private void Myo_PoseChanged(object sender, PoseEventArgs e)
        {
            Myo_SendToDebug(String.Format("{0} arm Myo detected {1} pose!", e.Myo.Arm, e.Myo.Pose));
        }

        private void Myo_Unlocked(object sender, MyoEventArgs e)
        {
            Myo_SendToDebug(String.Format("{0} arm Myo has unlocked!", e.Myo.Arm));
        }

        private void Myo_Locked(object sender, MyoEventArgs e)
        {
            Myo_SendToDebug(String.Format("{0} arm Myo has locked!", e.Myo.Arm));
        }
        #endregion

        #region Receiving

        private delegate void UpdateUiTextDelegate(string text);

        private void Receive(object sender, System.IO.Ports.SerialDataReceivedEventArgs e)
        {
            string receivedLine = serialCommService.ReadLine();

            if (receivedLine != null)
            {
                //Collecting the characters received to our 'buffer' (string).
                Dispatcher.Invoke(DispatcherPriority.Send, new UpdateUiTextDelegate(ReceiveCallback), receivedLine);
            }
        }

        private void ReceiveCallback(string text)
        {
            //Assign the value of the recieved_data to the RichTextBox.
            if (paragraph.Inlines.Count >= 12)
            {
                flowDocument.Blocks.Clear();
                paragraph.Inlines.Clear();
            }
            paragraph.Inlines.Add(text);
            flowDocument.Blocks.Add(paragraph);
            commDataRichTextBox.Document = flowDocument;
        }

        #endregion

        #region Drone controls
        private void sendSerialCommand()
        {
            throttleText.Text = PPMThrottle.ToString();
            aileronText.Text = PPMAileron.ToString();
            elevatorText.Text = PPMElevator.ToString();
            rudderText.Text = PPMRudder.ToString();

            serialCommService.SendLine(String.Concat(PPMThrottle.ToString(), ",", PPMAileron.ToString(), ",", PPMElevator.ToString(), ",", PPMRudder.ToString()));
        }

        #region Throttle
        private void SetThrottlePPM(int ppm)
        {
            if (ppm > PPMMax)
                ppm = PPMMax;

            else if (ppm < PPMMin)
                ppm = PPMMin;

            PPMThrottle = ppm;
            sendSerialCommand();
        }

        public void ThrottleUp(int ammount)
        {
            SetThrottlePPM(PPMThrottle + ammount);
        }

        public void ThrottleUp(object sender, RoutedEventArgs e)
        {
            ThrottleUp(50);
        }

        public void ThrottleDown(int ammount)
        {
            SetThrottlePPM(PPMThrottle - ammount);
        }

        public void ThrottleDown(object sender, RoutedEventArgs e)
        {
            ThrottleDown(50);
        }
        #endregion

        #region Aileron
        private void SetAileronPPM(int ppm)
        {
            if (ppm > PPMMax)
                ppm = PPMMax;

            else if (ppm < PPMMin)
                ppm = PPMMin;

            PPMAileron = ppm;
            sendSerialCommand();
        }

        public void AileronLeft()
        {
            SetAileronPPM(PPMMin);
        }

        public void AileronCenter()
        {
            SetAileronPPM(PPMMid);
        }

        public void AileronRight()
        {
            SetAileronPPM(PPMMax);
        }

        #endregion

        #region Elevator
        private void SetElevatorPPM(int ppm)
        {
            if (ppm > PPMMax)
                ppm = PPMMax;

            else if (ppm < PPMMin)
                ppm = PPMMin;

            PPMElevator = ppm;
            sendSerialCommand();
        }

        public void ElevatorUp()
        {
            SetElevatorPPM(PPMMax);
        }

        public void ElevatorCenter()
        {
            SetElevatorPPM(PPMMid);
        }


        public void ElevatorDown()
        {
            SetElevatorPPM(PPMMin);
        }

        #endregion

        #region Rudder
        private void SetRudderPPM(int ppm)
        {
            if (ppm > PPMMax)
                ppm = PPMMax;

            else if (ppm < PPMMin)
                ppm = PPMMin;

            PPMElevator = ppm;
            sendSerialCommand();
        }

        public void RudderFoward()
        {
            SetRudderPPM(PPMMax);
        }

        public void RudderCenter()
        {
            SetRudderPPM(PPMMid);
        }


        public void RudderBackward()
        {
            SetRudderPPM(PPMMin);
        }

        #endregion

        #endregion
    }
}
