var TextImageButtonResponsePlugin = (function (jspsych) {
  "use strict";

  const info = {
    name: "text-image-button-response",
    parameters: {
      stimulus: {
        type: jspsych.ParameterType.IMAGE,
        pretty_name: "Stimulus",
        default: undefined,
      },
      stimulus_height: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Image height",
        default: null,
      },
      stimulus_width: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Image width",
        default: null,
      },
      maintain_aspect_ratio: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Maintain aspect ratio",
        default: true,
      },
      choices: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Choices",
        default: undefined,
        array: true,
      },
      button_html: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Button HTML",
        default: '<button class="jspsych-btn">%choice%</button>',
        array: true,
      },
      prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Prompt",
        default: null,
      },
      stimulus_duration: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Stimulus duration",
        default: null,
      },
      trial_duration: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Trial duration",
        default: null,
      },
      margin_vertical: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Margin vertical",
        default: "0px",
      },
      margin_horizontal: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Margin horizontal",
        default: "8px",
      },
      response_ends_trial: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Response ends trial",
        default: true,
      },
      render_on_canvas: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Render on canvas",
        default: true,
      },
    },
  };

  /**
   * **text-image-button-response**
   *
   * SHORT PLUGIN DESCRIPTION
   *
   * @author YOUR NAME
   * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
   */
  class TextImageButtonResponsePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
  
    trial(display_element, trial) {
      let height, width;
      let html;
      if (trial.render_on_canvas) {
        let image_drawn = false;
        if (display_element.hasChildNodes()) {
          while (display_element.firstChild) {
            display_element.removeChild(display_element.firstChild);
          }
        }
        const canvas = document.createElement("canvas");
        canvas.id = "jspsych-image-button-response-stimulus";
        canvas.style.margin = "0";
        canvas.style.padding = "0";
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
          if (!image_drawn) {
            getHeightWidth();
            ctx.drawImage(img, 0, 0, width, height);
          }
        };
        img.src = trial.stimulus;
        const getHeightWidth = () => {
          if (trial.stimulus_height !== null) {
            height = trial.stimulus_height;
            if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
              width = img.naturalWidth * (trial.stimulus_height / img.naturalHeight);
            }
          } else {
            height = img.naturalHeight;
          }
          if (trial.stimulus_width !== null) {
            width = trial.stimulus_width;
            if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
              height = img.naturalHeight * (trial.stimulus_width / img.naturalWidth);
            }
          } else if (!(trial.stimulus_height !== null && trial.maintain_aspect_ratio)) {
            width = img.naturalWidth;
          }
          canvas.height = height;
          canvas.width = width;
        };
        getHeightWidth();
        const buttons = [];
        if (Array.isArray(trial.button_html)) {
          if (trial.button_html.length === trial.choices.length) {
            buttons = trial.button_html;
          } else {
            console.error("Error in image-button-response plugin. The length of the button_html array does not equal the length of the choices array");
          }
        } else {
          for (let i = 0; i < trial.choices.length; i++) {
            buttons.push(trial.button_html);
          }
        }
        const btngroup_div = document.createElement("div");
        btngroup_div.id = "jspsych-image-button-response-btngroup";
        html = "";
        for (let i = 0; i < trial.choices.length; i++) {
          const str = buttons[i].replace(/%choice%/g, trial.choices[i]);
          html += '<div class="jspsych-image-button-response-button" style="display: inline-block; margin:' + trial.margin_vertical + " " + trial.margin_horizontal + '" id="jspsych-image-button-response-button-' + i + '" data-choice="' + i + '">' + str + "</div>";
        }
        btngroup_div.innerHTML = html;

        // A. Moved to here
        if (trial.prompt !== null) {
          display_element.insertAdjacentHTML("beforeend", trial.prompt);
        }
        display_element.insertBefore(canvas, null);
        if (img.complete && Number.isFinite(width) && Number.isFinite(height)) {
          ctx.drawImage(img, 0, 0, width, height);
          image_drawn = true;
        }
        display_element.insertBefore(btngroup_div, canvas.nextElementSibling);
        // A. from here
      } else {

        //B. Moved to here
        if (trial.prompt !== null) {
            html = trial.prompt;
        } else{
            html = "";
        }

        // Image here
        html += '<img src="' + trial.stimulus + '" id="jspsych-image-button-response-stimulus">';
        const buttons = [];
        if (Array.isArray(trial.button_html)) {
          if (trial.button_html.length === trial.choices.length) {
            buttons = trial.button_html;
          } else {
            console.error("Error in image-button-response plugin. The length of the button_html array does not equal the length of the choices array");
          }
        } else {
          for (let i = 0; i < trial.choices.length; i++) {
            buttons.push(trial.button_html);
          }
        }

        // Button group
        html += '<div id="jspsych-image-button-response-btngroup">';
        for (let i = 0; i < trial.choices.length; i++) {
          const str = buttons[i].replace(/%choice%/g, trial.choices[i]);
          html += '<div class="jspsych-image-button-response-button" style="display: inline-block; margin:' + trial.margin_vertical + " " + trial.margin_horizontal + '" id="jspsych-image-button-response-button-' + i + '" data-choice="' + i + '">' + str + "</div>";
        }
        html += "</div>";
        
        // B. From here
        
        display_element.innerHTML = html;
        const img = display_element.querySelector("#jspsych-image-button-response-stimulus");
        if (trial.stimulus_height !== null) {
          height = trial.stimulus_height;
          if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
            width = img.naturalWidth * (trial.stimulus_height / img.naturalHeight);
          }
        } else {
          height = img.naturalHeight;
        }
        if (trial.stimulus_width !== null) {
          width = trial.stimulus_width;
          if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
            height = img.naturalHeight * (trial.stimulus_width / img.naturalWidth);
          }
        } else if (!(trial.stimulus_height !== null && trial.maintain_aspect_ratio)) {
          width = img.naturalWidth;
        }
        img.style.height = height.toString() + "px";
        img.style.width = width.toString() + "px";
      }
  
      const start_time = performance.now();
  
      for (let i = 0; i < trial.choices.length; i++) {
        display_element.querySelector("#jspsych-image-button-response-button-" + i).addEventListener("click", (e) => {
          const btn_el = e.currentTarget;
          const choice = btn_el.getAttribute("data-choice");
          after_response(choice);
        });
      }
  
      const response = {
        rt: null,
        button: null,
      };
  
      const end_trial = () => {
        this.jsPsych.pluginAPI.clearAllTimeouts();
        const trial_data = {
          rt: response.rt,
          stimulus: trial.stimulus,
          response: response.button,
        };
        display_element.innerHTML = "";
        this.jsPsych.finishTrial(trial_data);
      };
  
      function after_response(choice) {
        const end_time = performance.now();
        const rt = Math.round(end_time - start_time);
        response.button = parseInt(choice);
        response.rt = rt;
        display_element.querySelector("#jspsych-image-button-response-stimulus").className += " responded";
        const btns = document.querySelectorAll(".jspsych-image-button-response-button button");
        for (let i = 0; i < btns.length; i++) {
          btns[i].setAttribute("disabled", "disabled");
        }
        if (trial.response_ends_trial) {
          end_trial();
        }
      }
  
      if (trial.stimulus_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          display_element.querySelector("#jspsych-image-button-response-stimulus").style.visibility = "hidden";
        }, trial.stimulus_duration);
      }
  
      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          end_trial();
        }, trial.trial_duration);
      } else if (trial.response_ends_trial === false) {
        console.warn("The experiment may be deadlocked. Try setting a trial duration or set response_ends_trial to true.");
      }
    }
  
    simulate(trial, simulation_mode, simulation_options, load_callback) {
      if (simulation_mode === "data-only") {
        load_callback();
        this.simulate_data_only(trial, simulation_options);
      }
      if (simulation_mode === "visual") {
        this.simulate_visual(trial, simulation_options, load_callback);
      }
    }
  
    create_simulation_data(trial, simulation_options) {
      const default_data = {
        stimulus: trial.stimulus,
        rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
        response: this.jsPsych.randomization.randomInt(0, trial.choices.length - 1),
      };
  
      const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
  
      this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
  
      return data;
    }
  
    simulate_data_only(trial, simulation_options) {
      const data = this.create_simulation_data(trial, simulation_options);
      this.jsPsych.finishTrial(data);
    }
  
    simulate_visual(trial, simulation_options, load_callback) {
      const data = this.create_simulation_data(trial, simulation_options);
      const display_element = this.jsPsych.getDisplayElement();
      this.trial(display_element, trial);
      load_callback();
      if (data.rt !== null) {
        this.jsPsych.pluginAPI.clickTarget(display_element.querySelector(`div[data-choice="${data.response}"] button`), data.rt);
      }
    }
  }
  TextImageButtonResponsePlugin.info = info;

  return TextImageButtonResponsePlugin;
})(jsPsychModule);
