using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DroneControl.Input
{
    public class InputManager : Input
    {
        private List<Input> inputs = new List<Input>();
        private bool commandWasSent = false;

        /// <summary>
        /// Add an input module to the input manager. Output from this module is aggregated with 
        /// all other modules registered to the input manager. The input manager will start to 
        /// schedule calculation time via calls to processInput()
        /// </summary>
        /// <param name="input">input module to manage</param>
        public void addControl(Input input)
        {
            // Redirect the raised events
            input.Emergency += this.OnEmergency;
            input.FlatTrim += this.OnFlatTrim;
            input.Hover += this.OnHover;
            input.Land += this.OnLand;
            input.Progress += this.OnProgress;
            input.Takeoff += this.OnTakeoff;

            // Track if a command was sent during processInput
            input.Emergency += () => commandWasSent = true;
            input.FlatTrim += () => commandWasSent = true;
            input.Hover += () => commandWasSent = true;
            input.Land += () => commandWasSent = true;
            input.Progress += (mode, roll, pitch, yaw, gaz) => commandWasSent = true;
            input.Takeoff += () => commandWasSent = true;

            inputs.Add(input);
        }

        /// <summary>
        /// Instructs all managed input modules to process their associated input device
        /// and generate commands. Should be called regularly
        /// </summary>
        public override void processInput()
        {
            foreach (Input input in inputs)
            {
                input.processInput();
            }

            if (commandWasSent == false)
            {
                OnHover();
            }
            commandWasSent = false;
        }
    }
}
