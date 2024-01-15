## Reading libraries ----
library(here)
setwd(here())
library(tidyverse)
library(jsonlite)


## Reading data ----
stimuli <- read_csv(here("stimuli","verb_cloze_stimuli","verb_cloze_stimuli.csv")) |> 
  distinct(question, .keep_all = T) |> 
  mutate(animal = gsub("\\.","",animal))

stimuli2 <- read_csv(here("stimuli","verb_cloze_stimuli","verb_cloze_stimuli.csv")) |> 
  distinct(question_num, question, verb, animal, .keep_all = T) |> 
  mutate(animal = gsub("\\.","",animal))

## Question num ----
# Not sure about the question number, there are multiple questions per question num.

# How often does each verb occur?
stimuli |> 
  group_by(verb) |> 
  summarize(count = n())

# Checking the co-occurrence of question and verb.
table(qn = stimuli$question_num, verb = stimuli$verb) |> 
  data.frame() |> 
  ggplot(aes(x = qn, y = verb, fill = Freq))+
  geom_tile()+
  theme_bw()+
  xlab("Question number")

## For now, we'll create a new question index.

stimuli <- stimuli |> 
  mutate(index = 1:n())


## Create a json ----
# Index = index, inner json of other variables

# Very inefficient way to do this, but R doesn't normally use JSON.

full.json = list()

for(i in 1:nrow(stimuli)){
  row = stimuli[i,]
  temp.json <- list()
  key <- as.character(row$index)
  temp.json[[key]] <- list(SENTENCE = paste0("<p> ",
                                             row$question,
                                             " <input type = 'text' id='test-resp-box' name = 'user_response'></p>"),
                           verb = row$verb,
                           animal = row$animal,
                           norm_category = row$norm_category)
  full.json[[row$index]] <- temp.json
}


json_str <- toJSON(full.json, auto_unbox = TRUE)

writeLines(json_str, con = here("stimuli","verb_cloze_stimuli","updated_stimuli.json"))
