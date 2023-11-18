class FreeSortPlugin {
  constructor(jsPsych) {
      this.jsPsych = jsPsych;
  }

  static get info() {
      return {
          name: "free-sort",
          parameters: {
            stimuli: {
              type: ParameterType.IMAGE,
              pretty_name: "Stimuli",
              default: undefined,
              array: true,
            },
            stim_height: {
              type: ParameterType.INT,
              pretty_name: "Stimulus height",
              default: 100,
            },
            stim_width: {
              type: ParameterType.INT,
              pretty_name: "Stimulus width",
              default: 100,
            },
            scale_factor: {
              type: ParameterType.FLOAT,
              pretty_name: "Stimulus scaling factor",
              default: 1.5,
            },
            sort_area_height: {
              type: ParameterType.INT,
              pretty_name: "Sort area height",
              default: 700,
            },
            sort_area_width: {
              type: ParameterType.INT,
              pretty_name: "Sort area width",
              default: 700,
            },
            sort_area_shape: {
              type: ParameterType.SELECT,
              pretty_name: "Sort area shape",
              options: ["square", "ellipse"],
              default: "ellipse",
            },
            prompt: {
              type: ParameterType.HTML_STRING,
              pretty_name: "Prompt",
              default: "",
            },
            prompt_location: {
              type: ParameterType.SELECT,
              pretty_name: "Prompt location",
              options: ["above", "below"],
              default: "above",
            },
            button_label: {
              type: ParameterType.STRING,
              pretty_name: "Button label",
              default: "Continue",
            },
            change_border_background_color: {
              type: ParameterType.BOOL,
              pretty_name: "Change border background color",
              default: true,
            },
            border_color_in: {
              type: ParameterType.STRING,
              pretty_name: "Border color - in",
              default: "#a1d99b",
            },
            border_color_out: {
              type: ParameterType.STRING,
              pretty_name: "Border color - out",
              default: "#fc9272",
            },
            border_width: {
              type: ParameterType.INT,
              pretty_name: "Border width",
              default: null,
            },
            counter_text_unfinished: {
              type: ParameterType.HTML_STRING,
              pretty_name: "Counter text unfinished",
              default: "You still need to place %n% item%s% inside the sort area.",
            },
            counter_text_finished: {
              type: ParameterType.HTML_STRING,
              pretty_name: "Counter text finished",
              default: "All items placed. Feel free to reposition items if necessary.",
            },
            stim_starts_inside: {
              type: ParameterType.BOOL,
              pretty_name: "Stim starts inside",
              default: false,
            },
            column_spread_factor: {
              type: ParameterType.FLOAT,
              pretty_name: "column spread factor",
              default: 1,
            },
              words: {
                  type: ParameterType.STRING,
                  pretty_name: "Words",
                  default: undefined,
                  array: true,
              },
          },
      };
  }

  trial(display_element, trial) {
    var start_time = performance.now();

    let wordImages = [];
    if (trial.words && trial.words.length > 0) {
        wordImages = trial.words.map(word => textToImage(word));
    }

    const stimuli = trial.stimuli.concat(wordImages);

    let init_locations = [];
    let moves = [];
    let inside = stimuli.map(() => trial.stim_starts_inside);
    let cur_in = false;

    let html =
        "<div " +
        'id="jspsych-free-sort-arena" ' +
        'class="jspsych-free-sort-arena" ' +
        'style="position: relative; width:' +
        trial.sort_area_width +
        "px; height:" +
        trial.sort_area_height +
        'px; margin: auto;"</div>';

        html +=
        "<div " +
        'id="jspsych-free-sort-border" ' +
        'class="jspsych-free-sort-border" ' +
        'style="position: relative; width:' +
        trial.sort_area_width * 0.94 +
        "px; height:" +
        trial.sort_area_height * 0.94 +
        "px; " +
        "border:" +
        border_width +
        "px solid " +
        border_color_out +
        "; margin: auto; line-height: 0em; ";
  
      if (trial.sort_area_shape == "ellipse") {
        html += 'webkit-border-radius: 50%; moz-border-radius: 50%; border-radius: 50%"></div>';
      } else {
        html += 'webkit-border-radius: 0%; moz-border-radius: 0%; border-radius: 0%"></div>';
      }
  
      const html_text =
        '<div style="line-height: 1.0em;">' +
        trial.prompt +
        '<p id="jspsych-free-sort-counter" style="display: inline-block;">' +
        get_counter_text(stimuli.length) +
        "</p></div>";
  
      if (trial.prompt_location == "below") {
        html += html_text;
      } else {
        html = html_text + html;
      }
      html +=
        '<div><button id="jspsych-free-sort-done-btn" class="jspsych-btn" ' +
        'style="margin-top: 5px; margin-bottom: 15px; visibility: hidden;">' +
        trial.button_label +
        "</button></div>";
  
      display_element.innerHTML = html;

      const draggables = Array.from(display_element.querySelectorAll(".jspsych-free-sort-draggable"));

      const border = display_element.querySelector("#jspsych-free-sort-border");
      const button = display_element.querySelector("#jspsych-free-sort-done-btn");

      if (inside.some(Boolean) && trial.change_border_background_color) {
        border.style.borderColor = trial.border_color_in;
      }
      if (inside.every(Boolean)) {
        if (trial.change_border_background_color) {
          border.style.background = trial.border_color_in;
        }
        button.style.visibility = "visible";
        display_element.querySelector("#jspsych-free-sort-counter").innerHTML =
          trial.counter_text_finished;
      }
  
      for (const draggable of draggables) {
          draggable.addEventListener("pointerdown", function (event) {
            const { clientX: pageX, clientY: pageY } = event;
            let x = pageX - this.offsetLeft;
            let y = pageY - this.offsetTop - window.scrollY;
            this.style.transform = "scale(" + trial.scale_factor + "," + trial.scale_factor + ")";
        
            const on_pointer_move = (moveEvent) => {
              const { clientX, clientY } = moveEvent;
              const cur_in = inside_ellipse(
                clientX - x,
                clientY - y,
                trial.sort_area_width * 0.5 - trial.stim_width * 0.5,
                trial.sort_area_height * 0.5 - trial.stim_height * 0.5,
                trial.sort_area_width * 0.5,
                trial.sort_area_height * 0.5,
                trial.sort_area_shape == "square"
              );
              
            this.style.top =
              Math.min(
                trial.sort_area_height - trial.stim_height * 0.5,
                Math.max(-trial.stim_height * 0.5, clientY - y)
              ) + "px";
            this.style.left =
              Math.min(
                trial.sort_area_width * 1.5 - trial.stim_width,
                Math.max(-trial.sort_area_width * 0.5, clientX - x)
              ) + "px";
  
            if (trial.change_border_background_color) {
              if (cur_in) {
                border.style.borderColor = trial.border_color_in;
                border.style.background = "None";
              } else {
                border.style.borderColor = border_color_out;
                border.style.background = "None";
              }
            }
  
            var elem_number = parseInt(this.id.split("jspsych-free-sort-draggable-")[1], 10);
            inside.splice(elem_number, 1, cur_in);
  
            if (inside.every(Boolean)) {
              if (trial.change_border_background_color) {
                border.style.background = trial.border_color_in;
              }
              button.style.visibility = "visible";
              display_element.querySelector("#jspsych-free-sort-counter").innerHTML =
                trial.counter_text_finished;
            } else {
              border.style.background = "none";
              button.style.visibility = "hidden";
              display_element.querySelector("#jspsych-free-sort-counter").innerHTML =
                get_counter_text(inside.length - inside.filter(Boolean).length);
            }
          };
          document.addEventListener("pointermove", on_pointer_move);
  
          const on_pointer_up = (e) => {
            document.removeEventListener("pointermove", on_pointer_move);
            this.style.transform = "scale(1, 1)";
            if (trial.change_border_background_color) {
              if (inside.every(Boolean)) {
                border.style.background = trial.border_color_in;
                border.style.borderColor = trial.border_color_in;
              } else {
                border.style.background = "none";
                border.style.borderColor = border_color_out;
              }
            }
            moves.push({
              src: this.dataset.src,
              x: this.offsetLeft,
              y: this.offsetTop,
            });
            document.removeEventListener("pointerup", on_pointer_up);
          };
          document.addEventListener("pointerup", on_pointer_up);
        });
      }
  
      display_element.querySelector("#jspsych-free-sort-done-btn").addEventListener("click", () => {
        if (inside.every(Boolean)) {
          const end_time = performance.now();
          const rt = Math.round(end_time - start_time);
          const items = display_element.querySelectorAll<HTMLElement>(".jspsych-free-sort-draggable");
          let final_locations = [];
          for (let i = 0; i < items.length; i++) {
            final_locations.push({
              src: items[i].dataset.src,
              x: parseInt(items[i].style.left),
              y: parseInt(items[i].style.top),
            });
          }
  
          const trial_data = {
            init_locations: init_locations,
            moves: moves,
            final_locations: final_locations,
            rt: rt,
          };
  
          display_element.innerHTML = "";
          this.jsPsych.finishTrial(trial_data);
        }
      });

    //   draggables.forEach(draggable => {
    //       let cur_in_draggable = false; 

    //       draggable.addEventListener("pointerdown", function (event) {
    //         const initialX = event.clientX;
    //         const initialY = event.clientY;
        
    //         const initialTop = this.offsetTop;
    //         const initialLeft = this.offsetLeft;
        
    //         const offsetX = initialX - initialLeft;
    //         const offsetY = initialY - initialTop;
        
    //         this.style.zIndex = "999"; 
    //         this.style.pointerEvents = "none"; 
        
    //         this.classList.add("dragging");
        
    //         cur_in_draggable = true;

    //         if (cur_in_draggable) {
    //           this.style.left = event.clientX - offsetX + "px";
    //           this.style.top = event.clientY - offsetY + "px";
    //       }
        
    //     });
        

    //     draggable.addEventListener("pointermove", function (event) {
      
    //       this.style.left = event.clientX - offsetX + "px";
    //       this.style.top = event.clientY - offsetY + "px";
      
    //       // if (cur_in_draggable) {
      
    //       // }
    //   });
      

    //   draggable.addEventListener("pointerup", function (event) {
    
    //     this.style.zIndex = ""; 
    //     this.style.pointerEvents = ""; 
    //     this.classList.remove("dragging"); 
    
    //     if (cur_in_draggable) {
    
    //     }
    
    //     cur_in_draggable = false;
    
    // });
    
    //   });

      function get_counter_text(n) {
        var text_out = "";
        var text_bits = trial.counter_text_unfinished.split("%");
        for (var i = 0; i < text_bits.length; i++) {
          if (i % 2 === 0) {
            text_out += text_bits[i];
          } else {
            if (text_bits[i] == "n") {
              text_out += n.toString();
            } else if (text_bits[i] == "s" && n > 1) {
              text_out += "s";
            }
          }
        }
        return text_out;
      }

      function textToImage(text) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        canvas.width = 200; 
        canvas.height = 50; 
    
        ctx.font = "20px Arial";
        ctx.fillStyle = "black"; 
        ctx.textAlign = "left"; 
    
        ctx.fillText(text, 10, 30); 
    
        return canvas.toDataURL(); 
    }
    
  }
}

export default FreeSortPlugin;
