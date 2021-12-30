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