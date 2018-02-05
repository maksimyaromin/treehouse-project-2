# Pagination & Content Filter
Second project potential realization for Full-Stack JS Developer Program. 

For the purpose of a current task I used jQuery library. The realization is expressed as a plugin. One can
apply it to any DOM element as follows:
```js
    $("{your selector here}").listItems({ ...your options here });
```

#### Plugin has a several settings:
| Setting | Description | Default value |
| --- | --- | --- |
| `total` | Page element quantity  | *10* |
| `enabledSearchBox` | Search field enabled | *true* |
| `searchPlaceholder` | Search hint | *Start entering name or email* |
| `noData` | HTML element markup, which displays in case of data absence  | ```html <div class="no-students"> <span>Sorry, no princes here</span> </div> ``` |
| `source` | element list | ```js new Array(0) ``` |


Default file with element array *./app/source/students.json*. To run this file in application Babel and  *inline-json-import* plugin are used.

If one needs to reassemble an application with another element array gulp-task might be used: 
```shell
    gulp build
```

In case of  browser JS disabling the request will be addressed to the page /index-without-js.html, where the whole list will be displayed with no pagination and search box (see comments for additional information).

As before I used SCSS as preprocessor. And as usual, to start a project the following commands might be used:
```shell
    npm install
    npm start
```
#### This time I strongly suggest to  restore at least jQuery using npm. Otherwise an application  will not work.

In order to quicken interest instead of list of students  I used a list of Belorussian grandee, Polish and Lithuanian magnate princes [Radzivill](https://ru.wikipedia.org/wiki/%D0%A0%D0%B0%D0%B4%D0%B7%D0%B8%D0%B2%D0%B8%D0%BB%D0%BB%D1%8B). Information on prince's names and dates of birth is taken from Wikipedia.

### I hope you will enjoy it. Max Eremin

#### Notes
1. Thank you, now I understand your detailed comments. I've deleted the noscript sulution. To built the application in real life project you would probably need to create html pages on server (i.e. with a help of view engine like Razor or ejs). Whether you need to load elements list from server (database sever) after page rendering you might need to use my previous solution to maintain disabled JavaScript. To see the result please open index.html file. Also I've added index-46.html to prove that the script will work with different size array. 

#### Thank you for your reviews!

### Notes 2
1. Dear friends, I assume we have come to a deadlock. Now I am sending my project for review for the forth time. The project, which I believe met all the requirements even at first time. That is pretty hard for me to understand why your grader (Nic Hampton) as far as I can see wasn't even bothered start the project I sent for review for the first and third time. Whether it is easier to estimate an existing project then I can find a project on GitHub and send it for review. But I suppose it is not the target of the Program. I completely agree the comments of your second grader. He said that it is OK that my project a bit different while it mets the requirements. The grader also said that solution with noscript is not satisfying and that was the reason why I didn't meet term "Progressive enhancement & unobtrusive JavaScript". And I agree that it is much better when site uses one version but not two as I did with noscript (I just decided that noscript is easier and for that project the way to reach operativity is not principal). So far I reviewed my project by myself and didn't find any misfit to "Uses inline JavaScript" and  "HTML markup for search box or pagination is shown/hidden in the HTML markup instead of being created dynamically". Never the less I made some changes in my project according to second grader remarks. Even though I didn't open your files I am pretty sure that my project differs from yours only in data array. Now after all the last Nic Hampton's review I consider to be illiquid. I reread terms and conditions to the Task and didn't find any requirements like "to pass the task you must load our files" (that might be strange enough if you want to teach students to think). So I interpret the files as a help for those who have no idea of styles and markup as far as this course is for JS developers. If the rules are described somewhere I didn't find please send me a link. I would like to point your attention to the fact that I can make it by myself (as your second grader confirmed) and very much interested in your Program as it offers very challenging tasks. Nic Hampton stated that I am here to get the Certificate. This is half true. I pay my money to get some knowledge from your courses. And it is also challenging for me to do 12 original project you propose. But regular rejection of my project for not explained reason postpones the Program end. This makes me think that it is made on purpose to make me pay more. As far as I meet I conditions and do not violate written rules I with great emphasis insist on reviewing my code once again  by competent grader.
