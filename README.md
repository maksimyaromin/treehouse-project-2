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