//---------------------------------------------------------
function Animal(name) {
    this.init(name)
}

Animal.prototype.init = function(name) {
    this.name = name
}

Animal.prototype.answer = function(string) {
    console.log(this.constructor.name + " " + this.name + ": " + string)
}

Animal.prototype.talk = function() {
    this.answer("I can't talk")
}

//---------------------------------------------------------
function Fish(name) {
    Animal.call(this, name)
}

Fish.prototype.__proto__ = Animal.prototype

//---------------------------------------------------------
function Cat(name) {
    Animal.call(this, name)
}

Cat.prototype.talk = function() {
    this.answer("meow")
}

Cat.prototype.__proto__ = Animal.prototype

//---------------------------------------------------------
fish = new Fish("Wanda")
cat  = new Cat("Garfield")

fish.talk()
cat.talk()