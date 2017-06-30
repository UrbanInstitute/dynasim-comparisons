# Dynasim: Exploring Social Security reform options

Compare the distribution of Social Security, total income, and net income by demographic group and year under several reform options. The interactive lives [here](http://www.urban.org/exploring-social-security-reform-options).

## Scripts

### formatdata.R
[formatdata.R](scripts/formatdata.R) formats and joins researcher-provided CSVs, creating [allscenarios_new.csv](data/allscenarios_new.csv)

### min-max.R
min-max.R calculates minimums and maximums for `d3.scale.linear` in charts.js

### charts.js
[charts.js](https://github.com/UrbanInstitute/dynasim-comparisons/blob/gh-pages/js/charts.js) creates the charts which are iframed into its parent, [graphic.html](https://github.com/UrbanInstitute/dynasim-comparisons/blob/gh-pages/graphic.html) using `Pym.js`.

### graphic.html
[graphic.html](https://github.com/UrbanInstitute/dynasim-comparisons/blob/gh-pages/graphic.html) creates the interactive which is iframed into its parent, [index.html](https://github.com/UrbanInstitute/dynasim-comparisons/blob/gh-pages/index.html) using `Pym.js`.

### index.html
[index.html](https://github.com/UrbanInstitute/dynasim-comparisons/blob/gh-pages/index.html) combined text and the interactive and is the final document which is iframed on to Urban.org. 

## Built With
* R
* d3.min.js

## Authors
* Karen Smith
* Melissa Favreault 
* Hannah Recht
* Aaron Williams

Data source: Urban Institute's Dynamic Simulation of Income Model (DYNASIM), 2015

