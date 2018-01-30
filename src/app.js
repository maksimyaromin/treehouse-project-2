import source from "./source/students.json";

{
    /* Simple realization of float placeholder. In real life project
       you would surely like to analyze whether the field has a value from the start.
       But I consider it needless for our example.
    */
    const activePlaceholder = (element) => {
        const action = () => {
            if(element.val()) {
                element.addClass("fill");
            } else {
                element.removeClass("fill");
            }
        };
        element.on("blur clear-search-field", action);
    };

    /* Array realization logics encapsulated in jQuery-extension.
       i.e. the task is realized as a simple jQuery-plugin.
    */
    $.fn.listItems = function(options) {
        // Default settings
        const defaultOptions = {
            total: 10,
            enabledSearchBox: true,
            searchPlaceholder: "Start entering name or email",
            noData: 
                `<div class="no-students">
                    <span>Sorry, no princes here</span>
                </div>`,
            source: new Array(0)
        };
        options = Object.assign({}, defaultOptions, options);

        // Some global for plugin variables 
        const context = this;
        let listContext = null;
        let pagerContext = null;
        
        let dirty = false;
        let hasPager = false;
        
        /* Application status. Let's pay some respect to React, as far as after long practice with it 
           my hands automatically long to realize logics in that way.
        */
        let state = {
            page: 0,
            oldPage: 0,
            source: options.source,
            total: 0,
            totalPages: 0
        };

        /* To make it more simple some plugin helper methods encapsulated into separate name space. 
        */
        const API = {
            /* Search field mapping. In my example I decided not to make a search button (hope, is not a
               too big violation of task conditions). I made a simple autocomplete here.
            */
            buildSearchBox() {
                if(!this.hasSource()) { return; }
                const searchBox = $(
                    `<div class="search-box">
                        <form action="#" class="search-box__form">
                            <div class="search-box__input">
                                <input type="search" name="search" id="search" />
                                <span class="active-placeholder">${options.searchPlaceholder}</span>
                            </div>
                        </form>
                    </div>`
                );
                context.before(searchBox);
                const search = searchBox.find(`[type="search"], [type="text"]`);
                activePlaceholder(search);

                // Just in case it is better to disable form submission on Enter button pressing
                searchBox.find("form").on("keyup keypress", e => {
                    const keyCode = e.keyCode || e.which;
                    if (keyCode === 13) { 
                        e.preventDefault();
                        return false;
                    }
                });
                /* Search logics. On input event expiration if a certain value entered 
                    then we start searching for  matching among names and e-mails. If the value is empty then  
                    a source list is displaying. Of course in real life project you might want to limit search start with
                    a certain quantity of symbols or call frequency by using kind of debounce method.  But
                    I didn't implement it here. By the way I am aware of input event doesn't work in old version IE and
                    there exist onpropertychange to resolve it, but we shouldn't focus on IE8 in our 2018. 
                    IMPORTANT: filter searches by  letter combination entered (I just consider it to be more interesting)
                */
                search.on("input", (e) => {
                    const value = $(e.target).val();
                    if(value) {
                        const source = options.source.filter(item => {
                            const pattern = new RegExp(value, "i");
                            return pattern.test(item.name) 
                                || pattern.test(item.email);
                        });
                        const newState = {
                            source, page: 0
                        };
                        /*Save selected page to return to it when a user cleans a search field 
                        */
                        if(state.page) {
                            newState.oldPage = state.page;
                        }
                        state = Object.assign(
                            {},
                            state,
                            newState
                        );
                        this.build();
                    } else {
                        state = Object.assign(
                            {},
                            state,
                            { source: options.source, page: state.oldPage }
                        );
                        this.build();
                    }
                });
            },
            /* Build pagination in case of need (i.e.the data array is more than for one page).
               Build is based on object current state 
            */
            buildPager() {
                let pager = 
                    `<div class="pager-box">
                        <ol class="pager">[pages]</ol>
                        <div class="pager__range-mark">
                            <span class="range"></span>
                            <span>out of</span>
                            <span class="count">${state.total}</span>
                        </div>
                    </div>`;
                let pages = "";
                for (let i = 0; i < state.totalPages; i++) {
                    pages += 
                        `<li class="page${i === state.page ? " state_active" : ""}" data-page="${i}">
                            ${i + 1}
                        </li>`;
                }
                pager = pager.replace(/\[pages\]/i, pages);
                context.after(pager);
                pagerContext = $(".pager-box");
            },
            /* Adding to list DOM element. The method is quite simple, but I separated it
               to save a plugin modal system (and just in case we need that in future)
            */
            buildList() {
                listContext = $(`<ul class="students__list"></ul>`);
                context.prepend(listContext);
            },
            /* Add new element to the list according to template
            */
            buildItem(item) {
                listContext.append(
                    `<li class="students__item student" data-item-id="${item.id}">
                        <div class="student__avatar">
                            <img alt="${item.name}" src="${item.avatar}" />
                        </div>
                        <div class="student__contact">
                            <div class="student__name">
                                <span>${item.name}</span>
                            </div>
                            <div class="student__email">
                                <a href="mailto:${item.email}">${item.email}</a>
                            </div>
                        </div>
                        <div class="mark">
                            <span>Born</span>
                            <time datetime="${item.at}">
                                ${(new Date(item.at)).toLocaleDateString()}
                            </time>
                        </div>
                    </li>`
                );
            },
            /* Deleting programmatically created elements from DOM and cleaning global variables 
	           before list rebuild
            */
            clear() {
                if(dirty) {
                    context.html("");
                    dirty = false;
                    listContext = null;
                }
                if(hasPager && pagerContext) {
                    pagerContext.remove();
                    hasPager = false;
                    pagerContext = null;
                }
            },
            // Get elements for current page from state
            getItems() {
                const lastIndex = state.total - 1;
                const startIndex = state.page * options.total;
                let endIndex = startIndex + options.total - 1;
                if(endIndex > lastIndex) {
                    endIndex = lastIndex;
                }
                const items = new Array(0);
                for (let i = startIndex; i <= endIndex; i++) {
                    items.push(state.source[i]);
                }
                if(hasPager) {
                    const markRange = pagerContext.find(".range");
                    markRange.text(`${startIndex + 1} - ${endIndex + 1}`)
                }
                return items;
            },
            // Add all elements for current page to the list
            buildItems() {
                if(!listContext) { return; }
                listContext.html("");
                const items = this.getItems();
                for (const item of items) {
                    this.buildItem(item);
                }
            },
            // Add possible events for the list (i.e. page transitions)
            bindListEvents() {
                if(hasPager) {
                    const pages = pagerContext.find(".page");
                    pages.click((e) => {
                        pages.removeClass("state_active");
                        const page = $(e.target).closest("li");
                        page.addClass("state_active");
                        state = Object.assign(
                            {}, 
                            state, 
                            { page: page.data("page") }
                        );
                        this.buildItems();
                    });
                }
            },
            /* Does a state have any elements to display? Here I dodged a bit. The method is called twice:
               each time when a new list is building and when search field is being depicted. Search field 
               is displaying only once, that is why the method will return true only if set of element  is more than null.
            */
            hasSource() {
                return state.source instanceof Array && state.source.length;
            },
            // Call all needed methods and display list
            build() {
                this.clear();
                if(!this.hasSource()) {
                    return context.html(options.noData);
                }
                const listSize = state.source.length;
                const pagesCount = Math.ceil(listSize/ options.total);
                this.buildList();
                state = Object.assign({}, state, {
                    total: listSize,
                    totalPages: pagesCount
                });
                if(state.totalPages > 1) {
                    this.buildPager();
                    hasPager = true;
                } else {
                    hasPager = false;
                }
                this.buildItems();
                dirty = true;

                this.bindListEvents();
            }
        };

        /* Display list at application start and if search field is enabled
        */
        const init = () => {
            API.build();
            if(options.enabledSearchBox) {
                API.buildSearchBox();
            }
        };
        init();
        
    };

    $(document).ready(() => {
        $("#year").text((new Date()).getFullYear());

        $(".students").listItems({
            source
        });
    });
}