library(tidyverse)
library(here)
setwd(here())
library(jsonlite)

# Functions ----

## Function to read in the data
read_jatos <- function(file){
  data <- lapply(readLines(here("data", file)),
                 function(line) fromJSON(line))
  
  new.df <- data.frame() 
  
  for (subjdata in data){
    
    if (length(colnames(subjdata)) == 9){ # Didn't do any of the experiment.
      subjdata <- subjdata |> 
        mutate(given_sentence = NA,
               verb = NA, animal = NA,
               norm_category = NA, question_order = NA, pass = FALSE)
    
    } else if (length(colnames(subjdata)) == 13) { # Didn't do demographic
      subjdata <- subjdata |> 
        mutate(question_order = NA, pass = FALSE) 
      
    }else {
      subjdata <- subjdata |> 
        mutate(pass = TRUE)
    }
    new.df <- rbind(new.df,
                    as.data.frame(subjdata))
  }
  
  return(new.df) 
}
