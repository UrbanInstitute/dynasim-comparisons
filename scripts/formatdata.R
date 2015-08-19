#Hannah Recht, 08-18-15
#Dynasim scenario comparisons
#Read in data from multiple CSVs, reshape

require(dplyr)
require(tidyr)
require(reshape2)

s1 <- read.csv("data/original/BPCid912EQUIVALENTPAYABLET3.csv", stringsAsFactors = F, na=".")
s2 <- read.csv("data/original/BPCid912EQUIVALENTOPT0T3.csv", stringsAsFactors = F, na=".")
s3 <- read.csv("data/original/BPCid912OPT0T3.csv", stringsAsFactors = F, na=".")
s4 <- read.csv("data/original/BPCid912PAYABLET3.csv", stringsAsFactors = F, na=".")

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
    mutate(catval=ifelse(catlab=="62-69" | catlab=="Female" | catlab=="1.High School Dropout" | catlab=="Single" | catlab=="1.White", 1, 
                                    ifelse(catlab=="70-74" | catlab=="Male" | catlab=="2.High School Graduate" | catlab=="Married" | catlab=="2.Black", 2,
                                           ifelse(catlab=="75-79" | catlab=="3.Some College" | catlab=="Divorced" | catlab=="3.Hispanic" , 3,
                                                  ifelse(catlab=="80-84" | catlab=="4.College Graduate" | catlab=="Widowed" | catlab=="4.Other", 4,
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
s1<-format(s1)
s2<-format(s2)
s3<-format(s3)
s4<-format(s4)

write.csv(s1, "data/payable_equivalent.csv",na="",row.names = F)
write.csv(s2, "data/scheduled_equivalent.csv",na="",row.names = F)
write.csv(s3, "data/scheduled_percapita.csv",na="",row.names = F)
write.csv(s4, "data/payable_percapita.csv",na="",row.names = F)

#rename vars and join scenarios into one big data frame

s1 <- s1 %>% rename(wealth_1=wealth,ss_1=ss,income_1=income)
s2 <- s2 %>% rename(wealth_2=wealth,ss_2=ss,income_2=income)
s3 <- s3 %>% rename(wealth_3=wealth,ss_3=ss,income_3=income)
s4 <- s4 %>% rename(wealth_4=wealth,ss_4=ss,income_4=income)

all = left_join(s1,s2,by=c("year","category","catval", "percentile"))
all = left_join(all,s3,by=c("year","category","catval", "percentile"))
all = left_join(all,s4,by=c("year","category","catval", "percentile"))
write.csv(all, "data/allscenarios.csv",na="",row.names = F)

#read in later sessions
all <- read.csv("data/allscenarios.csv", stringsAsFactors = F)