import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.xml.sax.InputSource;


public class Test {

@SuppressWarnings("unchecked")
static public void main(String[] args) throws Throwable {

    int            anInteger        = 42;
    float          aFloat           = 6.66f;
    boolean        aBoolean         = true;
    String         aString          = "Lorem ipsum dolor sit amet, consectetur " + 
        "adipiscing elit. Curabitur volutpat enim nec orci rhoncus id fringilla " + 
        "arcu lacinia. Integer nec purus eu est rutrum pharetra non non nulla.";
    Object         aNull            = null;
    double         aNaN             = Math.sqrt(-1.0);
    Point          anObject         = new Point(5, 25);
    PrintablePoint aPrintableObject = new PrintablePoint(5,25);
    Map            aMap             = new HashMap();
    List           aList            = new ArrayList();
    Object[]       anArray;
    Node           anElement        = getXmlNode(); 
    
    aMap.put("anInteger", anInteger);
    aMap.put("aFloat", aFloat); 
    aMap.put("aBoolean", aBoolean);
    aMap.put("aString", aString);
    aMap.put("aNull", aNull);
    aMap.put("aNaN", aNaN);
    aMap.put("anObject", anObject);
    aMap.put("aPrintableObject", aPrintableObject);
    aMap.put("anElement", anElement);
    
    aList.add(anInteger);
    aList.add(aFloat); 
    aList.add(aBoolean);
    aList.add(aString);
    aList.add(aNull);
    aList.add(aNaN);
    aList.add(anObject);
    aList.add(aPrintableObject);
    aList.add(anElement);
    anArray = aList.toArray();
    
    System.out.println("done");
}

static Node getXmlNode() throws Throwable {
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    factory.setValidating(true);
    DocumentBuilder builder = factory.newDocumentBuilder();
    String xml = "<body><h1 id='body_title'>A Survey of Data Display in JavaScript Debuggersx</h1></body>";
    InputSource is = new InputSource(new StringReader(xml));
    Document document = builder.parse(is);
    Node node = document.getElementsByTagName("h1").item(0);
    
    return node;
}

static class Point {
    int x; 
    int y;
    
    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
}

static class PrintablePoint extends Point {

    public PrintablePoint(int x, int y) {
        super(x,y);
    }

    public String toString() {
        return "[x: " + this.x + ", y: " + this.y + "]";
    }
}

}
