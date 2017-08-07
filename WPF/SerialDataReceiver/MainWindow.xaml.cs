using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Threading;
using MahApps.Metro.Controls;

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
		private Paragraph paragraph { get; set; }

        //Control variables
        private const int PPMMin = 1000;    //Min rotation (1000)
        private const int PPMMax = 2000;    //Max rotation (2000)
        private const int PPMMid = 1500;
        public int PPMThrottle { get; set;}
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
            paragraph = new Paragraph();

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
        }

        private void OnButtonKeyDown(object sender, KeyEventArgs e) {
            e.Handled = true;

            switch (e.Key) {
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
			Commdata.Document = flowDocument;
		}

        #endregion

        #region Drone controls
        private void sendSerialCommand() {
            throttleText.Text = PPMThrottle.ToString();
            aileronText.Text = PPMAileron.ToString();
            elevatorText.Text = PPMElevator.ToString();
            rudderText.Text = PPMRudder.ToString();

            serialCommService.SendLine(String.Concat(PPMThrottle.ToString(),",",PPMAileron.ToString(),",",PPMElevator.ToString(),",",PPMRudder.ToString()));
        }

        #region Throttle
        private void SetThrottlePPM(int ppm) {
            if (ppm > PPMMax)
                ppm = PPMMax;

            else if (ppm < PPMMin)
                ppm = PPMMin;

            PPMThrottle = ppm;
            sendSerialCommand();
        }

        public void ThrottleUp(int ammount) {
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

        public void AileronCenter() {
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

        public void ElevatorCenter() {
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

        public void RudderCenter() {
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
