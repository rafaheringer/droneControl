using MyoSharp.Communication;
using MyoSharp.Device;
using MyoSharp.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Documents;

namespace VisualController
{
    public class MyoHandler : MainWindow
    {
        //Richtextbox
        private FlowDocument flowDocumentMyo { get; set; }
        private Paragraph paragraphMyo { get; set; }

        public MyoHandler() {
            paragraphMyo = new Paragraph();
            flowDocumentMyo = new FlowDocument();

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
                //Myo_UserInputLoop(hub);
            }
        }

        #region Myo Event Handlers
        private void Myo_UserInputLoop(MyoSharp.Device.IHub hub)
        {
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
            //paragraphMyo.Inlines.Add(text);
            //flowDocumentMyo.Blocks.Add(paragraphMyo);
            //myoDataRichTextBox.Document = flowDocumentMyo;
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
