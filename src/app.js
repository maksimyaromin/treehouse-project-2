import source from "./source/students.json";

{
    /* Простая реализация плавающего плэйсхолдера. В реальном проекте
       вы наверняка захотите анализировать есть ли в поле значение изначально,
       но для нашего примера это лишнее
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

    /* Логика реализации списка инкапсулировано в jQuery-расширение.
       Т. е. выполнение задания выполнено в виде простого jQuery-плагина
    */
    $.fn.listItems = function(options) {
        // Настройки по-умолчанию
        const defaultOptions = {
            total: 10,
            enabledSearchBox: true,
            searchPlaceholder: "Start entering name or email",
            noData: 
                `<div class="no-students">
                    <span>Ups! No students for display</span>
                </div>`,
            source: new Array(0)
        };
        options = Object.assign({}, defaultOptions, options);

        // Некоторые глобальные для плагина переменные
        const context = this;
        let listContext = null;
        let pagerContext = null;
        
        let dirty = false;
        let hasPager = false;
        
        /* Состояние приложение. Отдадим дань уважения Реакту, после работы на нем руки сами тянуться
           реализовывать подобную логику подобным образом
        */
        let state = {
            page: 0,
            oldPage: 0,
            source: options.source,
            total: 0,
            totalPages: 0
        };

        /* Некоторые вспомогательные методы для плагина инкапсулированы в отдельное пространство имен
           для простоты
        */
        const API = {
            /* Построение поля поиска. В моем примере я решил не делать кнопку для поиска (надеюсь это 
               не слишком большое нарушение условия задания). Я сделал простую реализацию автокомплита.
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

                // На всякий случай отключить отправку форму по нажатию Ентер
                searchBox.find("form").on("keyup keypress", e => {
                    const keyCode = e.keyCode || e.which;
                    if (keyCode === 13) { 
                        e.preventDefault();
                        return false;
                    }
                });
                /* Собственно логика поиска. По срабатыванию события input если присутствует введенное
                   значение, то ищем совпадение среди имен и имэйлов. Если значение отсутсвует, то загружаем
                   исходный список. Разумеется, в реальном проекте вам может захотеться ограничить начало поиска
                   определенным количеством символов или же частоту вызовов методом на подобие debounce, но тут
                   я этого не делал. Опять же, да, я знаю, что событие input не работает в старых IE
                   и для них существует onpropertychange, но нам в 2018 не следует ориентироваться на 
                   IE8. ВАЖНО: фильтр осуществляет поиск по наличию введенного буквосочетания (просто мне
                   кажется что так инетерсней)
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
                        /*Сохраняем выбранную страницу, для того чтобы на нее вернуться, когда пользователь
                          очистит поле поиска
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
            /* Строим пагинацию если она нужна (т. е. если у нас данных больше чем на одну страницу).
               Построение основано на текущем состоянии объекта state 
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
            /* Добавление в ДОМ элемента списка. Методо очень прост, но я вынес его отдельно для
               сохранения модульной системы плагина (и на будущее, мало ли что понадобиться)
            */
            buildList() {
                listContext = $(`<ul class="students__list"></ul>`);
                context.prepend(listContext);
            },
            /* Добавить новый элемент в список по шаблону
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
            /* Удаление всех программно созданных элементов из ДОМ и очистка 
               глобальных переменных перед перерисовкой списка
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
            // Получение элементов для текущей страницы из состояния
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
            // Добавить все элементы для текущей страницы в список
            buildItems() {
                if(!listContext) { return; }
                listContext.html("");
                const items = this.getItems();
                for (const item of items) {
                    this.buildItem(item);
                }
            },
            // Подключение возможных возможных событий для списка (например, перехода по страницам)
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
            /* Есть ли в состоянии элементы для отображения? Тут я схитрил. Этот метод вызывается два раза:
               каждый раз при построении нового списка и когда отрисовывается поле для поиска. Поле для поиска
               отрисовывается один раз и поэтому метод вернет тру только если весь набор элементов для списка
               больше нуля.*/
            hasSource() {
                return state.source instanceof Array && state.source.length;
            },
            // Вызвать все необходимые методы попорядку и нарисовать список
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

        /* Отрисовка списка при запуске прилодения и, если включено, поля поиска
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