$('document').ready(function(){
    var navigation = {
        $window: $(window),
        $navigation: $('#navigation'),
        $navigationInner: $('.js-navigation-inner'),
        $navigationLinks: $('.js-navigation-link'),
        $header: $('.js-page-header'),
        $document: $('document'),
        $body: $('html, body'),
        $goTop: $('.js-go-top'),
        $navigationLogo: $('.js-navigation-logo'),
        $destinationTarget: 0,

        navigationLogoWidth: 0,
        windowHeight: '',
        navigationHeight: '',
        $navigationItems: '',
        $activeNavigationItem: '',
        navigationPosition: '',
        sections: [],
        headerHeight: '',
        lastScrollTop: '',
        sectionIndex: '',

        isFirstScreen: function (scrollPosition) {
            if (scrollPosition > this.windowHeight) {
                return false;
            } else {
                return true;
            }
        },

        getNavigationPosition: function () {
            return this.$navigation.offset().top + this.navigationHeight + this.headerHeight;
        },

        hide: function () {
            this.$header.addClass('page__header--hidden');
            this.$navigation.addClass('float-navigation--hidden');
        },

        show: function () {
            this.$header.removeClass('page__header--hidden');
            this.$navigation.removeClass('float-navigation--hidden');
        },

        isMobile: function () {
            if(window.orientation !== undefined || this.$window.width() < 660) {
                return true;
            } else {
                return false;
            }
        },

        makeItemActive: function (obj) {
            this.$navigationItems.removeClass('active');

            obj.addClass('active');

            this.$navigationInner.stop().animate({
                'scrollLeft': obj.position().left + this.navigationLogoWidth
            }, 500, 'linear');
        },


        init: function (callback) {
            this.windowHeight = this.$window.height();
            this.navigationHeight = this.$navigation.height();
            this.$navigationItems = this.$navigationLinks.parent();
            this.navigationLogoWidth = this.$navigationLogo.width();

            if (this.$window.width() < 668) {
                this.headerHeight = this.$header.height();
            } else {
                this.headerHeight = 0;
            }

            var getSectionsCallback = function (index, element) {
                this.sections.push({
                    'sectionId': $(element).attr('href'),
                    'offsetTop': Math.floor($($(element).attr('href')).offset().top),
                    'index': index,
                    'linkElement': element
                })
            }

            var updateSectionsPosition = function () {
                this.sections.forEach(function (element) {
                    element.offsetTop = Math.floor($(element.sectionId).offset().top);
                })
            }

            var onClickCallback = function (e) {
                e.preventDefault();
                $z = $(e.target);

                this.makeItemActive($z.parent());
                var target = $z.attr('href');
                this.$destinationTarget = 1;

                if (history.pushState) {
                    history.pushState(null, null, target);
                }
                else {
                    location.hash = target;
                }

                var completeCallback = function () {
                    navigation.$destinationTarget = 0;
                }

                this.$body.stop().animate(
                    {
                        'scrollTop': $(target).offset().top - this.navigationHeight - this.headerHeight
                    },
                    {
                        duration: 1000,
                        easing: 'swing',
                        complete: completeCallback.bind(this)
                    }
                );
            }

            var onScrollCallback = function (e) {
                this.navigationPosition = this.getNavigationPosition();

                if (this.isFirstScreen(this.navigationPosition)) {
                    this.$navigation.fadeOut();
                } else {
                    this.$navigation.fadeIn();
                }

                for (var i = this.sections.length - 1; i >= 0; i--) {
                    if (this.navigationPosition >= this.sections[i]['offsetTop']) {
                        if (this.sectionIndex != i) {

                            var currentItem = $(this.sections[i]['linkElement']).parent();
                            if ( this.$destinationTarget !== 1) {
                                this.makeItemActive(currentItem);
                            }

                            this.sectionIndex = i;
                        }
                        break;
                    }
                }
            };


            var hideAndShowMobileHeaders = function () {
                var state = this.$body.scrollTop();
                if (this.$destinationTarget !== 1) {
                    if (state > this.lastScrollTop){
                        this.hide();
                    } else if (state + 50 < this.lastScrollTop) {
                        this.show();
                    }
                    this.lastScrollTop = state;
                }
            }

            var goTopCallback = function (e) {
                e.preventDefault();

                this.$body.stop().animate({
                    'scrollTop': 0
                }, 1000, 'swing');
            }

            this.navigationPosition = this.getNavigationPosition();

            if (!(this.isFirstScreen(this.navigationPosition))) {
                this.$navigation.css({'visibility': 'visible'});
                this.$navigation.fadeIn(0);
            }
            else {
                this.$navigation.fadeOut(0);
                this.$navigation.css({'visibility': 'visible'});
            }

            this.$navigationLinks.each(getSectionsCallback.bind(this));

            this.$navigationLinks.on('click', updateSectionsPosition.bind(this)).on('click', onClickCallback.bind(this));

            if(this.isMobile()) {
                this.$window
                    .on('scroll', onScrollCallback.bind(this))
                    .on('scroll', hideAndShowMobileHeaders.bind(this));
            } else {
                this.$window.on('scroll', onScrollCallback.bind(this));
            }

            this.$goTop.on('click', goTopCallback.bind(this));
        }
    }

    navigation.init();
});
