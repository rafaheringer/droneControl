using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Documents;
using System.Windows.Threading;
using MahApps.Metro.Controls;
using MyoSharp.Communication;
using MyoSharp.Device;
using MyoSharp.Exceptions;
using System.Windows.Input;

namespace VisualController
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : MetroWindow
    {
        #region variables
        //Richtextbox
        private FlowDocument flowDocument;
        private Paragraph paragraph;

        private FlowDocument flowDocumentMyo;
        private Paragraph paragraphMyo;

        //Control variables
        private const int PPMMin = 1000;    //Min rotation (1000)
        private const int PPMMax = 2000;    //Max rotation (2000)
        private const int PPMMid = 1500;
        public int PPMThrottle;
        public int PPMAileron;
        public int PPMElevator;
        public int PPMRudder;

        //Serial control
        private string serialPortName;
        private SerialDataReceiver.Services.SerialCommService serialCommService;
        #endregion

        public MainWindow()
        {
            //Variables
            flowDocument = new FlowDocument();
            paragraph = new Paragraph();

            paragraphMyo = new Paragraph();
            flowDocumentMyo = new FlowDocument();

            PPMThrottle = PPMMin;
            PPMAileron = PPMMid;
            PPMElevator = PPMMid;
            PPMRudder = PPMMid;

            serialCommService = new SerialDataReceiver.Services.SerialCommService();

            //Components
            InitializeComponent();

            //Overwite to ensure state
            connectBtn.Content = "Connect";

            //Get all connected serial ports
            IEnumerable<string> serialPorts = SerialDataReceiver.Services.SerialCommService.GetOpenedSerialComms();
            commPortNames.ItemsSource = serialPorts;
            commPortNames.SelectedIndex = 0;

            //Keydown bindings
            this.KeyDown += new KeyEventHandler(OnButtonKeyDown);
            this.KeyUp += new KeyEventHandler(OnButtonKeyUp);

            //Myo
            ,MyoHandler();
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

        #region Myo Events
        private void MyoHandler()
        {
            //Create a hub that will manage Myo devices for us
            var channel = Channel.Create(ChannelDriver.Create(ChannelBridge.Create(), MyoErrorHandlerDriver.Create(MyoErrorHandlerBridge.Create())));
            var hub = Hub.Create(channel);

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

    }
}

