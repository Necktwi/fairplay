/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var is = document.getElementsByTagName("img");
var ofs = {};
for (var i in is) {
    if (is[i] && is[i].style) {
        ofs[i] = is[i].offsetLeft;
        is[i].style.position = "absolute";
    }
}
var a = 0;
animFunc = function() {
    return window.innerWidth * Math.sin(22 / 700 * a) / 2;
};
animate = function() {
    for (var i in is) {
        if (is[i] && is[i].style) {
            is[i].style.left = ofs[i] + animFunc() + 'px';
        }
    }
    a++;
    window.setTimeout(animate, 10);
};
animate();

mammal = function() {
    this.doLove = function(mate) {
        debugger;
        if (mate && mate !== this && (mate.__proto__ instanceof mammal) && mate.sex !== this.sex) {
            var baby = {};
            baby.__proto__ = new mammal();
            for (var i in this) {
                baby[i] = this[i];
            }
            baby.babies = [];
            this.babyCount++;
            mate.babyCount++;
            baby.babyCount = 0;
            baby.name = "kitten";
            baby.parents = [this, mate];
            baby.dob = Date();
            baby.sex = parseInt(Math.random() * 10) >= 5 ? "male" : "female";
            this.babies.push(baby);
            mate.babies.push(baby);
            return baby;
        }
    };
    this.babyCount = 0;
    this.babies = [];
    this.sex = "";
    this.__defineSetter__("sex", function() {
        if (arguments.caller === this.doLove) {
            if (argument[0] === "male") {
                return "male";
            } else if (argument[0] === "female") {
                return "female";
            }
        }
    });
};

kittyTheMotherOfAllCats = {
    __proto__: new mammal(),
    shout: function() {
        return "meow";
    },
    name: "kittyTheMotherOfAllCats",
    sex: "female"
};
kittuTheFatherOfAllCats = {
    __proto__: new mammal(),
    shout: function() {
        return "meow";
    },
    name: "kittuTheFatherOfAllCats",
    sex: "male"
};

dog = {
    __proto__: mammal,
    shout: function() {
        return "bow";
    }
};
