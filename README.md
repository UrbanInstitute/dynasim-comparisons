# Dynasim: Exploring Social Security reform options

Compare the distribution of Social Security, total income, and net income by demographic group and year under several reform options. The interactive lives [here](http://www.urban.org/exploring-social-security-reform-options).

## Scripts

### formatdata.R
[formatdata.R](scripts/formatdata.R) formats and joins researcher-provided CSVs, creating [allscenarios_new.csv](data/allscenarios_new.csv)

###charts.js

### graphic.html
[graphic.html](https://github.com/UrbanInstitute/dynasim-comparisons/blob/gh-pages/graphic.html) creates the interactive which is iframed into its parent, [index.html](https://github.com/UrbanInstitute/dynasim-comparisons/blob/gh-pages/index.html) using `Pym.js`.

### index.html
[index.html](https://github.com/UrbanInstitute/dynasim-comparisons/blob/gh-pages/index.html) combined text and the interactive and is the final document which is iframed on to Urban.org. 

## Built With
* R

## Authors
* Karen Smith
* Melissa Favreault 
* Hannah Recht
* Aaron Williams

## License


Data source: Urban Institute's Dynamic Simulation of Income Model (DYNASIM), 2015

