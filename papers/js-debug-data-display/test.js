function run() {
    var anInteger        = 42;
    var aFloat           = 6.66;
    var aBoolean         = true;
    var aString          = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
        "Curabitur volutpat enim nec orci rhoncus id fringilla arcu lacinia. " + 
        "Integer nec purus eu est rutrum pharetra non non nulla.";
    var aNull            = null;
    var anUndefined      = undefined;
    var aNaN             = 1/undefined;
    var anObject         = {x: 5, y: 25};
    var aPrintableObject = {x: 5, y: 25};
    var aMap             = {};
    var anArray          = [];
    var anArguments      = arguments;
    var anElement        = document.getElementById("body_title")
    
    aPrintableObject.toString = function() {
        return "[x: " + this.x + ", y: " + this.y + "]";
    }
    
    aMap.anInteger        = anInteger;
    aMap.aFloat           = aFloat;
    aMap.aBoolean         = aBoolean;
    aMap.aString          = aString;
    aMap.aNull            = aNull;
    aMap.anUndefined      = anUndefined;
    aMap.aNaN             = aNaN;
    aMap.aPrintableObject = aPrintableObject;
    aMap.aMap             = aMap;
    aMap.anArray          = anArray;
    aMap.anArguments      = anArguments;
    aMap.anElement        = anElement;

    anArray.push(anInteger);
    anArray.push(aFloat);
    anArray.push(aBoolean);
    anArray.push(aString);
    anArray.push(aNull);
    anArray.push(anUndefined);
    anArray.push(aNaN);
    anArray.push(anObject);
    anArray.push(aPrintableObject);
    anArray.push(aMap);
    anArray.push(anArguments);
    anArray.push(anElement);
    
    debugger;
}
