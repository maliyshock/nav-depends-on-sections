jQuery(function($) {
    $( window ).load( function() {
        var navigation = {
            $window: $(window),
            $navigation: $('#navigation'),
            $navigationInner: $('.js-navigation-inner'),
            $navigationLinks: $('.js-navigation-link'),
            $navigationItem: $('.js-navigation-item'),
            $header: $('.js-page-header'),
            $document: $('document'),
            $body: $('html, body'),
            $goTop: $('.js-go-top'),
            $navigationLogo: $('.js-navigation-logo'),
            $magicLine: $(".js-magic-line"),
            $pageWrapper: $("#page__wrapper"),
            $currentItem: $('.js-navigation-item.active'),

            defaultMagicLineWidth: 100,
            destinationTarget: 0,
            currentLinkAnchor: '',

            navigationLogoWidth: 0,
            windowHeight: '',
            navigationHeight: '',
            $navigationItems: '',
            navigationPosition: '',
            sections: [],
            links: [],
            headerHeight: '',
            lastScrollTop: '',
            sectionIndex: '',
            scrollTopState: '',

            isFirstScreen: function (scrollPosition) {
                if (scrollPosition > this.windowHeight) {
                    return false;
                } else {
                    return true;
                }
            },

            getCurrentPosition: function () {
                return this.$navigation.offset().top + this.navigationHeight + this.headerHeight;
            },

            hideHeaders: function () {
                this.$header.addClass('page__header--hidden');
                this.$navigation.addClass('float-navigation--hidden');
                this.$pageWrapper.addClass('headers--hidden');
            },

            showHeaders: function () {
                this.$header.removeClass('page__header--hidden');
                this.$navigation.removeClass('float-navigation--hidden');
                this.$pageWrapper.removeClass('headers--hidden');
            },

            isMobile: function () {
                if(window.orientation !== undefined || this.$window.width() < 660) {
                    return true;
                } else {
                    return false;
                }
            },

            scrollSubMenuTo: function (value) {
                this.$navigationInner.stop().animate({
                    'scrollLeft': value + this.navigationLogoWidth
                }, 500, 'linear');
            },

            makeItemActive: function ($item) {
                this.$navigationItems.removeClass('active');
                $item.addClass('active');

                this.$currentItem = $item;
                this.currentLinkAnchor = $item.find(this.$navigationLinks).attr('href');
                this.moveMagicLine(this.links[this.currentLinkAnchor]['linePosition'], this.links[this.currentLinkAnchor]['scaleValue'] );
            },

            setLinks: function(index, element) {
                var $element = $(element);
                var width = $element.width();
                var scaleValue = width / this.defaultMagicLineWidth;

                this.links[$element.attr('href')] = {
                    'index': index,
                    'element': element,
                    'width': $element.width(),
                    'scaleValue': scaleValue,
                    'linePosition': $element.position().left,
                    'item': $element.parent()
                }
            },


            setSections: function (index, element) {
                var $element = $(element);
                var $section = $($element.attr('href'));

                this.sections.push({
                    'sectionId': $element.attr('href'),
                    'offsetTop': Math.floor($section.offset().top),
                    'index': index,
                    'linkElement': element
                })
            },

            goTop: function (e) {
                e.preventDefault();

                this.$body.stop().animate({
                    'scrollTop': 0
                }, 1000, 'swing');
            },


            isSectionChanged: function () {
                this.navigationPosition = this.getCurrentPosition();
                for (var i = this.sections.length - 1; i >= 0; i--) {
                    if (this.navigationPosition >= this.sections[i]['offsetTop']) {
                        if (this.sectionIndex !== i) {
                            this.currentItem = $(this.sections[i]['linkElement']).parent();
                            this.sectionIndex = i;
                            return true;
                        } else {
                            return false;
                        }
                        break;
                    }
                }
            },

            changeMenuState: function () {
                if ( this.destinationTarget !== 1) {
                    this.makeItemActive( this.currentItem);
                    this.scrollSubMenuTo(this.links[this.currentLinkAnchor]['linePosition']);
                    this.moveMagicLine(this.links[this.currentLinkAnchor]['linePosition'], this.links[this.currentLinkAnchor]['scaleValue'] );
                }
            },

            scrollToTarget: function (target) {
                this.$body.stop().animate({
                        'scrollTop': $(target).offset().top - this.navigationHeight - this.headerHeight
                    },{
                        duration: 1000,
                        easing: 'swing',
                        complete:  function () {
                            this.destinationTarget = 0;
                        }.bind(this)
                    }
                );
            },

            writeDownInHistory: function (target) {
                // refactor  destinationTarget
                this.destinationTarget = 1;

                if (history.pushState) {
                    history.pushState(null, null, target);
                } else {
                    location.hash = target;
                }
            },

            updateSectionsPosition: function () {
                this.sections.forEach(function (element) {
                    element.offsetTop = Math.floor($(element.sectionId).offset().top);
                })
            },

            toggleMobileHeaders: function () {
                if (this.destinationTarget !== 1) {
                    if (this.scrollTopState > this.lastScrollTop){
                        this.hideHeaders();
                    } else if (this.scrollTopState + 50 < this.lastScrollTop) {
                        this.showHeaders();
                    }
                    this.lastScrollTop = this.scrollTopState;
                }
            },

            toggleNavigation: function () {
                if (this.isFirstScreen(this.navigationPosition)) {
                    this.$navigation.fadeOut();
                } else {
                    this.$navigation.fadeIn();
                }
            },


            moveMagicLine: function (leftPos, scaleValue) {
                this.$magicLine.css({
                    'transform': 'translateX('+leftPos+'px) scaleX('+scaleValue+')'
                })
            },

            initMagicLine: function () {
                this.$magicLine.css({
                    'width': this.defaultMagicLineWidth
                }).addClass('active');

                this.moveMagicLine(this.links[this.currentLinkAnchor]['linePosition'], this.links[this.currentLinkAnchor]['scaleValue']);

                this.$navigationItem.hover(
                    function (e) {
                        var linkAnchor = e.currentTarget.children[0].hash;
                        this.moveMagicLine( this.links[linkAnchor]['linePosition'], this.links[linkAnchor]['scaleValue'] )
                    }.bind(this),

                    function (e) {
                        this.moveMagicLine(this.links[this.currentLinkAnchor]['linePosition'], this.links[this.currentLinkAnchor]['scaleValue'] );
                    }.bind(this)
                );
            },

            init: function () {
                this.windowHeight = this.$window.height();
                this.navigationHeight = this.$navigation.height();
                this.$navigationItems = this.$navigationLinks.parent();
                this.navigationLogoWidth = this.$navigationLogo.width();
                this.scrollTopState = this.$window.scrollTop();


                if (this.$window.width() < 668) {
                    this.headerHeight = this.$header.height();
                } else {
                    this.headerHeight = 0;
                }

                this.navigationPosition = this.getCurrentPosition();


                // when page is loaded
                //  -   we dont want flash navigation, so we set in css visibility hidden
                //  -   end here we show or hide navigation dependently is this first screen or not
                if ( !(this.isFirstScreen(this.navigationPosition)) ) {
                    this.$navigation.css({'visibility':'visible', 'display': 'block'});
                }
                else if ( !(this.isMobile()) ) {
                    this.$navigation.css({'visibility':'visible', 'display': 'none'});
                }

                this.$navigationLinks.each( function(index, element) {
                    this.setSections.call(this, index, element);
                    this.setLinks.call(this, index, element);
                }.bind(this));

                if( this.isSectionChanged() ) {
                    this.changeMenuState();
                } else {
                    this.currentLinkAnchor = this.$currentItem.find(this.$navigationLinks).attr('href');
                }

                this.initMagicLine();

                this.$navigationItem.on('click', function (e) {
                    $(e.target).find(this.$navigationLinks).click();
                })

                this.$navigationLinks
                    .on('click', function(e) {
                            e.preventDefault();

                            this.updateSectionsPosition.call(this)

                            var $z = $(e.target);
                            var $item = $z.parent();
                            var target = $z.attr('href');

                            this.makeItemActive( $item );
                            this.writeDownInHistory.call(this, target)
                            this.scrollToTarget(target);

                        }.bind(this)
                    );

                this.$goTop.on('click', this.goTop.bind(this));



                this.$window.on('scroll', function() {
                    this.scrollTopState = this.$window.scrollTop();

                    if(this.isSectionChanged.call(this)) {
                        this.changeMenuState();
                    }
                    if( this.isMobile() ) {
                        // this.toggleMobileHeaders.call(this);
                        this.toggleMobileHeaders();
                    } else {
                        this.toggleNavigation();
                    }

                }.bind(this));
            },

        }


        navigation.init();
    });
});