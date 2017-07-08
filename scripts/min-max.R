# Aaron Williams, Urban Institute Income and Benefits Policy Center, 2017-06-30

# Calculate minimums and maximums for setting scales in charts.js

library(tidyverse)


dynasim <- read_csv("data/allscenarios_new.csv", 
                    col_types = cols(
                      .default = col_double(),
                      year = col_integer(),
                      category = col_character(),
                      catval = col_integer(),
                      percentile = col_integer(),
                      ss_7_pc_change = col_integer(),
                      ss_7_eq_change = col_integer()
                    ))

dynasim_max <- dynasim %>%
  filter(percentile <= 95) %>%
  select(-year:-percentile) %>%
  summarize_all(funs(max)) %>%
  gather(key = "key", value = "value")

dynasim_min <- dynasim %>%
  filter(percentile <= 95) %>%  
  select(-year:-percentile) %>%
  summarize_all(funs(min)) %>%
  gather(key = "key", value = "value")