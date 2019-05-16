#---------------------------------------------------------
class Animal
    constructor: (aName) ->
        @init(aName)

    init: (aName) ->
        @name = aName

    answer: (string) ->
        console.log "#{@constructor.name} #{@name}: #{string}"

    talk: ->
        @answer "I can't talk"

#---------------------------------------------------------
class Fish extends Animal
    constructor: (aName) ->
        super

#---------------------------------------------------------
class Cat extends Animal
    constructor: (aName) ->
        super

    talk: ->
        @answer "meow"

#---------------------------------------------------------
fish = new Fish("Wanda")
cat  = new Cat("Garfield")

fish.talk()
cat.talk()