#Hannah Recht, 08-18-15
#Dynasim scenario comparisons
#Read in data from multiple CSVs, reshape

library(dplyr)
library(tidyr)
library(reshape2)

#Scenario names - Per capita = pc, Equivalent scale = eq
#s1_pc = Current Law Scheduled Per Capita Income and Assets (OPT)
#s1_eq = Current Law Scheduled Equivalent Income and Assets (equivalentOPT0)
#s2_pc = Current Law Payable Per Capita Income and Assets (PAYABLE)
#s2_eq = Current Law Payable Equivalent Income and Assets (equivalentPAYABLE)

s1_pc <- read.csv("data/original/BPCid912OPT0T3.csv", stringsAsFactors = F, na=".")
s1_eq <- read.csv("data/original/BPCid912EQUIVALENTOPT0T3.csv", stringsAsFactors = F, na=".")
s2_pc <- read.csv("data/original/BPCid912PAYABLET3.csv", stringsAsFactors = F, na=".")
s2_eq <- read.csv("data/original/BPCid912EQUIVALENTPAYABLET3.csv", stringsAsFactors = F, na=".")

format <- function(dt) {
  dt <- dt %>% select(Obs,year,age,male,xeduc,marstat,raceeth, pcincQ, everything()) %>% 
  filter(is.na(pcincQ)) %>%
  select (-pcincQ)
  #make demographic category and value labels in preparation for reshape  
  dt <- dt %>% mutate(category=ifelse(!is.na(raceeth), "race", 
                                      ifelse(!is.na(age), "age",
                                             ifelse(!is.na(male), "gender",
                                                    ifelse(!is.na(xeduc), "education",
                                                           ifelse(!is.na(marstat), "marstat","")))))) %>% 
    select(category,everything()) %>% 
    mutate(catlab=ifelse(!is.na(raceeth), raceeth, 
                         ifelse(!is.na(age), age,
                                ifelse(!is.na(male), male,
                                       ifelse(!is.na(xeduc), xeduc,
                                              ifelse(!is.na(marstat), marstat,"")))))) %>% 
    select(catlab,everything()) %>% 
    select(-raceeth, -age, -male, -xeduc, -marstat, -Obs)  %>% 
    mutate(catval=ifelse(catlab=="62-69" | catlab=="Female" | catlab=="1.High School Dropout" | catlab=="Married" | catlab=="1.White", 1, 
                                    ifelse(catlab=="70-74" | catlab=="Male" | catlab=="2.High School Graduate" | catlab=="Divorced" | catlab=="2.Black", 2,
                                           ifelse(catlab=="75-79" | catlab=="3.Some College" | catlab=="Widowed" | catlab=="3.Hispanic" , 3,
                                                  ifelse(catlab=="80-84" | catlab=="4.College Graduate" | catlab=="Single" | catlab=="4.Other", 4,
                                                         ifelse(catlab=="85+", 5,"")))))) %>%
    select(year, category, catval, catlab, everything()) %>% arrange(year, category, catval)
  
  #split by outcome for gather, then remerge later
  w <- dt %>% select(year,category,catval,num_range("w",1:100))
  wealth <- w %>% gather(percentile,"wealth",4:103)
  wealth$percentile = as.character(wealth$percentile)
  wealth <- wealth %>% mutate(percentile=substring(wealth$percentile, 2, nchar(wealth$percentile)))
  
  s <- dt %>% select(year,category,catval,num_range("s",1:100))
  ss <- s %>% gather(percentile,"ss",4:103)
  ss$percentile = as.character(ss$percentile)
  ss <- ss %>% mutate(percentile=substring(ss$percentile, 2, nchar(ss$percentile)))
  
  t <- dt %>% select(year,category,catval,num_range("t",1:100))
  income <- t %>% gather(percentile,"income",4:103)
  income$percentile = as.character(income$percentile)
  income <- income %>% mutate(percentile=substring(income$percentile, 2, nchar(income$percentile)))
  
  long = left_join(wealth, ss, by=c("year","category","catval", "percentile"))
  long = left_join(long, income, by=c("year","category","catval", "percentile"))
  long$percentile = as.numeric(long$percentile)
  long <- long %>% arrange(year,category,catval,percentile)
}

#format all scenarios and export
s1_pc<-format(s1_pc)
s1_eq<-format(s1_eq)
s2_pc<-format(s2_pc)
s2_eq<-format(s2_eq)

#rename vars and join scenarios into one big data frame

s1_pc <- s1_pc %>% rename(wealth_1_pc=wealth,ss_1_pc=ss,income_1_pc=income)
s1_eq <- s1_eq %>% rename(wealth_1_eq=wealth,ss_1_eq=ss,income_1_eq=income)
s2_pc <- s2_pc %>% rename(wealth_2_pc=wealth,ss_2_pc=ss,income_2_pc=income)
s2_eq <- s2_eq %>% rename(wealth_2_eq=wealth,ss_2_eq=ss,income_2_eq=income)

all <- left_join(s1_pc,s2_pc,by=c("year","category","catval", "percentile"))
all <- left_join(all,s1_eq,by=c("year","category","catval", "percentile"))
all <- left_join(all,s2_eq,by=c("year","category","catval", "percentile"))
write.csv(all, "data/allscenarios_new.csv",na="",row.names = F)

#read in later sessions
all <- read.csv("data/allscenarios_new.csv", stringsAsFactors = F)