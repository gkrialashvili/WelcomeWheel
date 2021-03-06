"use strict"
let parentProvidedScrollY;
let parentProvidedInnerHeight;

const translation = {
    freespin: {
        en: 'FREESPIN',
        ru: 'ФРИСПИНОВ',
        ka: 'ფრისპინი'
    }
}

function readCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

function getOutsideHeight() {
    window.addEventListener('message', (event) => {
        if (event.origin.includes('crocobet.com') && event.data) {
            if (event.data.scrollY && event.data.innerHeight) {
                parentProvidedScrollY = Number(event.data.scrollY);
                parentProvidedInnerHeight = Number(event.data.innerHeight);
            }
        }
    })
}
let currentCount;
let currentlevel;

getOutsideHeight();
var HistoryItem = (function HistoryItem () {

    function historyItem (date, prize) {
        this.spinDate = this.formatDate(date);
        this.prizeAmount = prize;
    }

    historyItem.prototype.formatDate = function ( dateObj ) {

        if (dateObj['getFullYear'] !== undefined && (typeof dateObj === 'object')) {
            var _date = dateObj;
            var day = this.prependZero( _date.getDate() );
            var month = this.prependZero( _date.getMonth() + 1 );
            return day + '.' + month;
        } else
            return '00.00';

    }
    historyItem.prototype.prependZero = function ( label ) {

        if (label < 10) {
            return '0' + label;
        }

        return label;

    }

    return historyItem;

}());

$( "#p-value" ).css({
    "width" : "70%"
});

var emitHeight = function( origin ) {
    window.parent.postMessage({
        'action': 'height',
        'code': 1003,
        'value': document.body.offsetHeight,
        'message': 'Height'
    }, origin);
};

$(window).on("load", function() {
    $( "#p-value" ).css({ "width" : "100%" });
    setTimeout(function(){
        $( "#loader" ).fadeOut( "slow" );
        $( ".section-dos" ).fadeIn( "slow" );
        emitHeight("*");
    }, 700);
});

$( document ).ready(function() {

    var OFFLINE_TEST_ENV = false;

    var IFRAME_ORIGIN = "*";

    var currentSpinAmount = 0;

    /*----- Declarations -----*/

    var REGISTER_MSG = {
        'action': 'register',
        'code': 1002,
        'message': 'Login command'
    };

    var AUTH_MSG = {
        'action': 'login',
        'code': 1001,
        'message': 'Login command'
    };

    var VERIFICATION_MSG = {
        'action': 'verification',
        'code': 1004,
        'message': 'Verification command'
    };
    var LANDING_HEIGHT = {
        'action': 'height',
        'code': 1003,
        'value': document.body.offsetHeight,
        'message': 'Height'
    };
    // initial info response

    var MOCK_USER_INFO = {
        currentLevel: 2,
        levels: [50, 250, 500, 1000],
        spinsLeft: 3,
        points: 750,
        unlockedLevel: 5
    };

    // response on spin
    var MOCK_SPIN_RESPONSE = {

    };

    // history items
    var MOCK_HISTORY_RESPONSE = {

    };

    // maps prizes (by ID) to their respective positions on the wheel.
    var prizeIdsToAngles = {
        1: 0,
        2: 50,
        3: 205,
        4: 255,
        5: 100,
        6: 155,
        7: 305
    };

    var prizeIdsToAmounts = {
        1: 25,
        2: 50,
        5: 500,
        6: 1000,
        3: 75,
        4: 100,
        7: 2000
    };
    class Events {
        static emitHeightControl() {
            window.parent.postMessage({
                'action': 'height',
                'code': 1003,
                'value': document.body.offsetHeight,
                'message': 'Height'
            }, IFRAME_ORIGIN)
        }
        static emitPoint(){
            window.parent.postMessage({
                'action': 'spin',
                'code': 1005,
                'value': currentCount,
                'currentLevel': currentlevel,
                'message': 'Spin'
            }, IFRAME_ORIGIN);
        }

    }
    var grabUserCredentials = function() {
        var queryString = window.location.search;
        var params = new URLSearchParams( queryString );

        if (params.get('tk') === null || params.get('id') === null || !!params.entries.length) {
            return false;
        }

        return {
            id: params.get('id'),
            tk: atob(params.get('tk'))
        };
    }

    // var historyItem = new HistoryItem(6, 1000); // test
    // console.log('ITEM: ', historyItem); // test

    /*----- State -----*/
    var rotationMeasure = 0;
    var spinBtnDisabled = false;
    var userCredentials = grabUserCredentials();


    var currentSpinAmountLabel = $( "#sport" );
    var progressBarCursor = $( "#bar-cursor" );
    var spinBtn = $( "#sportSpiner" );
    var wheel = $( ".wheel_frsp" );
    var wheelArrow = $( ".wheel_arrow" )[0];
    var prizeModal = $( ".popup-frsp" );
    var modalCloseBtn = $( ".close_pop" );
    var historyContainer = $( "#slotboardsr" );
    var registerBlock = $( ".register-form" );
    var verificationBlock = $( ".verification-container" );
    var veriContainer = $( ".verify" );

    var checkUserData = function( userData ) {
        return true;
    }
    function setHeight() {
        let currentHeight = 0;

        document.body.style.minHeight = 'unset';

        setInterval( () => {
            if (document.body.offsetHeight !== currentHeight) {
                currentHeight = document.body.offsetHeight;
                Events.emitHeightControl();
            }
        }, 250)
    }
    var initNPUEvents = function( unverified ) {
        if ( unverified ) {
            verificationBlock.css({
                "display" : "flex"
            });

            $( "#play-btn-main" ).css({
                "display" : "none"
            });
            registerBlock.css({
                "display" : "none"
            });
            veriContainer.css({
                "display" : "flex"
            });
            $('.bt-egt').css({
                "display" : "none"
            });
            $( "#verification-btn" ).on("click", function() {

                // console.log( VERIFICATION_MSG );

                window.parent.postMessage (
                    VERIFICATION_MSG,
                    IFRAME_ORIGIN
                );

            });


        } else {
            $('.bt-egt').css({
                "display" : "none"
            });
            registerBlock.css({
                "display" : "flex"
            });

            $( "#play-btn-main" ).css({
                "display" : "none"
            });
            veriContainer.css({
                "display" : "none"
            });


            $( ".register-butt" ).on("click", function() {

                // console.log('emit: ', REGISTER_MSG);

                window.parent.postMessage (
                    REGISTER_MSG,
                    IFRAME_ORIGIN
                );

            });

            $( ".login-butt" ).on("click", function () {

                // console.log('emit: ', AUTH_MSG);

                window.parent.postMessage (
                    AUTH_MSG,
                    IFRAME_ORIGIN
                );

            });

        }

    }


    var setInitialLandingState = function() {
        if ( !userCredentials ) {

            initNPUEvents();

        } else {

            if ( OFFLINE_TEST_ENV ) {

                alignSpinEvents();
                updateSpinCount( MOCK_USER_INFO.spinsLeft );
                drawBar( formatData(MOCK_USER_INFO) );

            }
            else {

                $.ajax({
                    type: "GET",
                    url: "https://cms.crocobet.com/campaigns/ufo-wheel-101221/user",
                    headers: {
                        "X-ODDS-SESSION" : userCredentials.tk
                    },
                    success: function ( response ) {
                        console.log('response: ', response);
                        if ( response && response['data'] && response['data']['metadata'] ) {
                            listenToHistoryBtnClick();
                            var userMetaData = response.data.metadata;
                            alignSpinEvents();
                            updateSpinCount( userMetaData.spinsLeft < 0 ? 0 : userMetaData.spinsLeft );
                            drawBar( formatData(userMetaData) );
                            currentlevel = userMetaData.currentLevel;
                            // $( "#play-btn-main" ).click(function() {
                            //     window.parent.postMessage({
                            //         'action': 'Play Singal',
                            //         'code': 1006,
                            //         'value': { playUFO: true },
                            //         'message': 'Play UFO'
                            //     },"*");
                            // });
                        }
                    },
                    error: function( xhr ) {
                        if ( xhr.status === 403 ) {
                            initNPUEvents( true );
                        } else {

                        }
                    }
                }).done(function( respData ) {
                    console.log( "Done for now." );
                });

            }

        }

    };

    var formatData = function( wheelData ) {
        return {
            currentLevel: wheelData.currentLevel,
            levels: wheelData.levels,
            spinsLeft: wheelData.spinsLeft,
            points: Math.floor( Math.min(wheelData.points, 1000) ),
            unlockedLevel: wheelData.unlockedLevel
        };
    };

    var drawBar = function( data ) {

        var barCalculator = WheelBarCalculator.getInstance( data.levels, data.points  );
        var fillData = barCalculator.getBarFillData();

        var baseFillAmount = fillData.segAmn;
        var fillInSegment = fillData.currentFill;

        var _filling = ((baseFillAmount * 24.5) + fillInSegment / 4);

        $(".green").css({
            "width" : + _filling + '%'
        });
        $( ".ind_wrp" ).css({
            "left" : (_filling + 6) + '%'
        });

        $( "#sport_prgrs" ).html(data.points + "₾");

    };
    var updateSpinCount = function( count ) {
        currentSpinAmount = count;
        currentSpinAmountLabel.html( count );
        currentCount = count;
        if ( count > 0 ) {
            $( ".spin_butt" ).addClass( "active" );
        }
    };

    var generateSpinAmountInRange = function ( min, max ) {

        var _rn;

        do {

            _rn = Math.floor( Math.random() * (max - min) ) + min;

        } while ( _rn === generateSpinAmountInRange.lastRnd );

        generateSpinAmountInRange.lastRnd = _rn;

        return  _rn;

    };

    var wheelSpinHandler = function() {
        console.log('CLICK')
        $('#sportSpiner').css('pointer-events','none');
        if (spinBtnDisabled) return;

        var prizeNum = 0;

        if ( OFFLINE_TEST_ENV ) {

            prizeNum = Math.floor( Math.random() * 6);
            if ( currentSpinAmount ) {
                spinTheWheel( prizeNum );
            }

        } else {

            if (currentSpinAmount) {

                $.ajax({
                    type: "POST",
                    url: "https://cms.crocobet.com/campaigns/ufo-wheel-101221/get-prize",
                    headers: {
                        "X-ODDS-SESSION" : userCredentials.tk
                    },
                    success: function( response ) {
                        if (response && response['data']) {
                            spinTheWheel( response.data.prize.id );
                        }
                    },
                    error: function( xhr ) {
                        $("#spin-error-modal").css({
                            "display" : "flex",
                            "z-index" : "20"
                        });
                        $("#error-modal-x").on("click", function() {
                            $("#spin-error-modal").css({
                                "display" : "none",
                                "z-index" : "-5"
                            });
                        });
                        console.log( xhr );
                    }
                });

            }

        }


    };

    var spinTheWheel = function( prizeId ) {

        var wheelSpinAngle = getSpinAngle( prizeId );
        var prizeAmount = getPrize( prizeId );

        var animeConfig = {
            targets: '.wheel_frsp',
            rotateZ: wheelSpinAngle + 'deg',
            duration: 5000,
            easing: 'easeInOutElastic(0.5, 1.2)',
            loopBegin: function() {
                spinBtnDisabled = true;
                $( ".spin_butt" )
                    .removeClass( "active" );
                updateSpinCount( currentSpinAmount - 1 );
                $('.history-container').css('pointer-events','none');
                $('#sportSpiner').css('pointer-events','none');
            },
            loopComplete: function() {
                setTimeout(function() {
                    showPrizeModal( prizeAmount );

                    window.parent.postMessage({
                        'action': 'spin',
                        'code': 1005,
                        'value': currentSpinAmount,
                        'message': 'New spin amount'
                    }, "*");
                }, 250);
                Events.emitPoint();
                $('.history-container').css('pointer-events','unset');
                $('#sportSpiner').css('pointer-events','unset');

            }
        };

        anime( animeConfig );

    }

    var restoreWheelPosition = function () {
        $( '.wheel_frsp' ).css({
            "transform" : "rotateZ(0deg)"
        });
    }

    var getSpinAngle = function ( prizeId ) {
        var rndSpinAmount = 3;
        return ( 360 * rndSpinAmount ) + prizeIdsToAngles[ prizeId ];
    }

    var getPrize = function( prizeId ) {
        return prizeIdsToAmounts[ prizeId ];
    }

    var populateSpinHistory = function( ) {
        $.ajax({
            type: "GET",
            url: "https://cms.crocobet.com/campaigns/ufo-wheel-101221/history",
            headers: {
                "X-ODDS-SESSION" : userCredentials.tk
            },
            success: function( response ) {
                if (response && response['data'] ) {
                    var rawHistoryItems = response.data;
                    console.log(rawHistoryItems);
                    $( ".borbal_lb_wrp" ).html('');


                    const lang = readCookie('lang');
                    console.log(lang);
                    for (var i = 0; i < rawHistoryItems.length; i++) {

                        var itemObj = new HistoryItem (
                            new Date( rawHistoryItems[i].createdAt ),
                            rawHistoryItems[i].prize.amount + ` ${translation.freespin[lang]}` );
                        var hItem = createDomItemForHistory( itemObj.spinDate, itemObj.prizeAmount );
                        $(".borbal_lb_wrp").append(hItem);
                    }

                }
            },
            error: function( xhr ) {
                console.log( xhr );
            }
        });
    };

    var createDomItemForHistory = function ( prizeDate, prizeAmount ) {
        var historyDOMItem = document.createElement("DIV");
        historyDOMItem.classList.add("borbal_lb_content");
        historyDOMItem.classList.add("sport");
        var lbDate = document.createElement("DIV");
        lbDate.classList.add("lb_date");
        var lbPrize = document.createElement("DIV");
        lbPrize.classList.add("lb_prize");
        historyDOMItem.append(lbDate);
        historyDOMItem.append(lbPrize);
        lbDate.innerHTML = prizeDate;
        lbPrize.innerHTML = prizeAmount;

        return historyDOMItem;
    };


    var showPrizeModal = function( prizeAmount ) {
        let middleOfTheScreen;
        if (parentProvidedInnerHeight && parentProvidedScrollY) {
            middleOfTheScreen = parentProvidedScrollY + ( (parentProvidedInnerHeight / 2) -125)
        } else {
            middleOfTheScreen = (window.innerHeight / 2) - 180;
        }

        const lang = readCookie('lang');

        $( "#frsp" ).html( prizeAmount + ` UFO ${translation.freespin[lang]}` );
        $( prizeModal ).css( 'top', middleOfTheScreen );
        prizeModal.removeClass( "hide" );
    };

    var hidePrizeModal = function() {
        prizeModal.addClass( "hide" );
        restoreWheelPosition();
        spinBtnDisabled = false;
    };

    var listenToHistoryBtnClick = function() {
        $( ".history-container" ).on("click", function () {

            populateSpinHistory();

        });
    };

    var alignSpinEvents = function() {
        spinBtn.click( wheelSpinHandler );
        modalCloseBtn.click( hidePrizeModal );
    };

    /*----- Runner -----*/
    setInitialLandingState(); // grab the initial data
    Events.emitHeightControl();
    setHeight();
});
"use strict";

var WheelBarCalculator = (function () {
    function WheelBarCalculator(milestones, currentPoints) {
        this.milestones = milestones;
        this.currentPoints = currentPoints;
    }
    WheelBarCalculator.getInstance = function (milestones, currentPoints) {
        if (!WheelBarCalculator.instance) {
            WheelBarCalculator.instance = new WheelBarCalculator(milestones, currentPoints);
        }
        return WheelBarCalculator.instance;
    };
    WheelBarCalculator.prototype.getBarFillData = function () {
        return {
            segAmn: this.getFilledSegmentAmount(),
            currentFill: this.getFillPercentageInSegment()
        };
    };
    WheelBarCalculator.prototype.getFilledSegmentAmount = function () {
        for (var i = 0; i < this.milestones.length; i++)
            if (this.currentPoints <= this.milestones[i])
                return i;
        return 0;
    };
    WheelBarCalculator.prototype.getFillPercentageInSegment = function () {
        var currentSegmentMlCapIdx = this.getFilledSegmentAmount();
        var prevCap = currentSegmentMlCapIdx ? this.milestones[currentSegmentMlCapIdx - 1] : 0;
        var totalAmountInSegment = this.milestones[currentSegmentMlCapIdx] - prevCap;
        var pointAmountPastLastSegment = this.currentPoints - prevCap;
        return (pointAmountPastLastSegment / totalAmountInSegment) * 100;
    };
    return WheelBarCalculator;
}());
