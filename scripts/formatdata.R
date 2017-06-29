#Hannah Recht, 08-18-15
#Aaron Williams, 6-29-2017

#Dynasim scenario comparisons
#Read in data from multiple CSVs, reshape

library(tidyverse)

#Scenario names - Per capita = pc, Equivalent scale = eq

s1_pc <- read_csv("data/original/PCCurrentLawScheduledT3.csv", na = ".")
s1_eq <- read_csv("data/original/EQCurrentLawScheduledT3.csv", na = ".")
s2_pc <- read_csv("data/original/PCPayableT3.csv", na = ".")
s2_eq <- read_csv("data/original/EQPayableT3.csv", na = ".")
s3_pc <- read_csv("data/original/PCIncreaseFRAT3.csv", na = ".")
s3_eq <- read_csv("data/original/EQIncreaseFRAT3.csv", na = ".")
s4_pc <- read_csv("data/original/PCincreaseFRAERAT3.csv", na = ".")
s4_eq <- read_csv("data/original/EQIncreaseFRAERAT3.csv", na = ".")
s5_pc <- read_csv("data/original/PCReduceCOLAT3.csv", na = ".")
s5_eq <- read_csv("data/original/EQReduceCOLAT3.csv", na = ".")
s6_pc <- read_csv("data/original/PCPCMiniPIAT3.csv", na = ".")
s6_eq <- read_csv("data/original/EQMiniPIAT3.csv", na = ".")
s7_pc <- read_csv("data/original/PCincreaseTaxSSBT3.csv", na = ".")
s7_eq <- read_csv("data/original/EQincreaseTaxSSBT3.csv", na = ".")
s8_pc <- read_csv("data/original/PCincreaseTAXMAXT3.csv", na = ".")
s8_eq <- read_csv("data/original/EQincreaseTAXMAXT3.csv", na = ".")

format <- function(dt) {
  dt <- dt %>% select(Obs, year, age, male, xeduc, marstat, raceeth, pcincQ, everything()) %>% 
    filter(is.na(pcincQ)) %>%
    rename(count2 = count) %>%
    select(-pcincQ) %>%
    #make demographic category and value labels in preparation for reshape  
    mutate(category = ifelse(!is.na(raceeth), "race", 
                        ifelse(!is.na(age), "age",
                          ifelse(!is.na(male), "gender",
                            ifelse(!is.na(xeduc), "education",
                              ifelse(!is.na(count2), "all",
                                ifelse(!is.na(marstat), "marstat",""))))))) %>% 
    select(category,everything()) %>%
    mutate(catlab = ifelse(!is.na(raceeth), raceeth, 
                      ifelse(!is.na(age), age,
                        ifelse(!is.na(male), male,
                          ifelse(!is.na(xeduc), xeduc,
                            ifelse(!is.na(count2), count2,
                              ifelse(!is.na(marstat), marstat,""))))))) %>% 
    select(catlab,everything()) %>% 
    select(-raceeth, -age, -male, -xeduc, -marstat, -Obs, -count2) %>%
    mutate(catval = ifelse(catlab == "All" | catlab == "62-69" | catlab == "Female" | catlab == "1.High School Dropout" | catlab == "Married" | catlab == "1.White", 1, 
                      ifelse(catlab == "70-74" | catlab == "Male" | catlab == "2.High School Graduate" | catlab == "Divorced" | catlab == "2.Black", 2,
                        ifelse(catlab == "75-79" | catlab == "3.Some College" | catlab == "Widowed" | catlab == "3.Hispanic" , 3,
                          ifelse(catlab == "80-84" | catlab == "4.College Graduate" | catlab == "Single" | catlab == "4.Other", 4,
                            ifelse(catlab == "85+", 5,"")))))) %>%
    select(year, category, catval, catlab, everything()) %>% 
    arrange(year, category, catval)
  
  #split by outcome for gather, then remerge later
  netinc <- dt %>% select(year, category, catval, num_range("w",1:100)) %>%
    gather(percentile, "netinc", 4:103) %>%
    mutate(percentile = as.character(percentile)) %>%
    mutate(percentile = substring(percentile, 2, nchar(percentile)))

  ss <- dt %>% select(year, category, catval, num_range("s",1:100)) %>% 
    gather(percentile, "ss", 4:103) %>%
    mutate(percentile = as.character(percentile)) %>%
    mutate(percentile = substring(percentile, 2, nchar(percentile)))
  
  income <- dt %>% select(year, category, catval, num_range("t", 1:100)) %>% 
    gather(percentile, "income", 4:103) %>%
    mutate(percentile = as.character(percentile)) %>%
    mutate(percentile = substring(percentile, 2, nchar(percentile)))
  
  left_join(netinc, ss, by = c("year","category","catval", "percentile")) %>%
    left_join(income, by = c("year","category","catval", "percentile")) %>%
    mutate(percentile = as.numeric(percentile)) %>% 
    arrange(year, category, catval, percentile)
}

#format all scenarios and export
s1_pc <- format(s1_pc) %>% rename(netinc_1_pc = netinc, ss_1_pc = ss, income_1_pc = income)
s1_eq <- format(s1_eq) %>% rename(netinc_1_eq = netinc, ss_1_eq = ss, income_1_eq = income)
s2_pc <- format(s2_pc) %>% rename(netinc_2_pc = netinc, ss_2_pc = ss, income_2_pc = income)
s2_eq <- format(s2_eq) %>% rename(netinc_2_eq = netinc, ss_2_eq = ss, income_2_eq = income)

s3_pc <- format(s3_pc) %>% rename(netinc_3_pc = netinc, ss_3_pc = ss, income_3_pc = income)
s3_eq <- format(s3_eq) %>% rename(netinc_3_eq = netinc, ss_3_eq = ss, income_3_eq = income)
s4_pc <- format(s4_pc) %>% rename(netinc_4_pc = netinc, ss_4_pc = ss, income_4_pc = income)
s4_eq <- format(s4_eq) %>% rename(netinc_4_eq = netinc, ss_4_eq = ss, income_4_eq = income)

s5_pc <- format(s5_pc) %>% rename(netinc_5_pc = netinc, ss_5_pc = ss, income_5_pc = income)
s5_eq <- format(s5_eq) %>% rename(netinc_5_eq = netinc, ss_5_eq = ss, income_5_eq = income)
s6_pc <- format(s6_pc) %>% rename(netinc_6_pc = netinc, ss_6_pc = ss, income_6_pc = income)
s6_eq <- format(s6_eq) %>% rename(netinc_6_eq = netinc, ss_6_eq = ss, income_6_eq = income)

s7_pc <- format(s7_pc) %>% rename(netinc_7_pc = netinc, ss_7_pc = ss, income_7_pc = income)
s7_eq <- format(s7_eq) %>% rename(netinc_7_eq = netinc, ss_7_eq = ss, income_7_eq = income)
s8_pc <- format(s8_pc) %>% rename(netinc_8_pc = netinc, ss_8_pc = ss, income_8_pc = income)
s8_eq <- format(s8_eq) %>% rename(netinc_8_eq = netinc, ss_8_eq = ss, income_8_eq = income)

pc <- left_join(s1_pc,s2_pc,by = c("year", "category", "catval", "percentile")) %>% 
  left_join(.,s3_pc,by = c("year", "category", "catval", "percentile")) %>% 
  left_join(.,s4_pc,by = c("year", "category", "catval", "percentile")) %>% 
  left_join(.,s5_pc,by = c("year", "category", "catval", "percentile")) %>% 
  left_join(.,s6_pc,by = c("year", "category", "catval", "percentile")) %>% 
  left_join(.,s7_pc,by = c("year", "category", "catval", "percentile")) %>% 
  left_join(.,s8_pc,by = c("year", "category", "catval", "percentile"))

eq <- left_join(s1_eq,s2_eq,by = c("year","category","catval", "percentile")) %>% 
  left_join(.,s3_eq,by = c("year", "category", "catval", "percentile")) %>% 
  left_join(.,s4_eq,by = c("year", "category", "catval", "percentile")) %>% 
  left_join(.,s5_eq,by = c("year", "category", "catval", "percentile")) %>% 
  left_join(.,s6_eq,by = c("year", "category", "catval", "percentile")) %>% 
  left_join(.,s7_eq,by = c("year", "category", "catval", "percentile")) %>% 
  left_join(.,s8_eq,by = c("year", "category", "catval", "percentile"))

rm(s1_pc, s1_eq, s2_pc, s2_eq, s3_pc, s3_eq, s4_pc, s4_eq, s5_pc, s5_eq, s6_pc, 
   s6_eq, s7_pc, s7_eq, s8_pc, s8_eq)

all <- left_join(pc, eq, by = c("year", "category", "catval", "percentile"))

rm(pc, eq)

# Show all values as percent of current law scheduled (scenario 1)
for (i in 2:8) {
	all[,paste("netinc", i, "pc", sep="_")] = all[,paste("netinc", i, "pc", sep="_")]/ all$netinc_1_pc
	all[,paste("ss", i, "pc", sep="_")] = all[,paste("ss", i, "pc", sep="_")]/ all$ss_1_pc
	all[,paste("income", i, "pc", sep="_")] = all[,paste("income", i, "pc", sep="_")]/ all$income_1_pc
	
	all[,paste("netinc", i, "eq", sep="_")] = all[,paste("netinc", i, "eq", sep="_")]/ all$netinc_1_eq
	all[,paste("ss", i, "eq", sep="_")] = all[,paste("ss", i, "eq", sep="_")]/ all$ss_1_eq
	all[,paste("income", i, "eq", sep="_")] = all[,paste("income", i, "eq", sep="_")]/ all$income_1_eq
}

summary(all)
# 0/0  = infinite
all[mapply(is.infinite, all)] <- NA

write_csv(all, "data/allscenarios_compare.csv", na = "")

#read in later sessions
all <- read_csv("data/allscenarios_new.csv")
