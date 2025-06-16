# API
## Functions

<dl>
<dt><a href="#annotateArcCommand">annotateArcCommand()</a></dt>
<dd><p><a href="https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes">https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes</a>
Fixes rX and rY.
Ensures lArcFlag and sweepFlag are 0 or 1
Adds center coordinates: command.cX, command.cY (relative or absolute, depending on command.relative)
Adds start and end arc parameters (in degrees): command.phi1, command.phi2; phi1 &lt; phi2 iff. c.sweepFlag == true</p>
</dd>
<dt><a href="#intersectionUnitCircleLine">intersectionUnitCircleLine()</a></dt>
<dd><p>Solves a quadratic system of equations of the form
     a * x + b * y = c
     x² + y² = 1
This can be understood as the intersection of the unit circle with a line.
     =&gt; y = (c - a x) / b
     =&gt; x² + (c - a x)² / b² = 1
     =&gt; x² b² + c² - 2 c a x + a² x² = b²
     =&gt; (a² + b²) x² - 2 a c x + (c² - b²) = 0</p>
</dd>
<dt><a href="#arePointsCollinear">arePointsCollinear(p1, p2, p3)</a> ⇒</dt>
<dd><p>Determines if three points are collinear (lie on the same straight line)
and the middle point is on the line segment between the first and third points</p>
</dd>
<dt><a href="#createEllipse">createEllipse()</a></dt>
<dd><p>Creates an ellipse path centered at (cx,cy) with radii rx and ry</p>
</dd>
<dt><a href="#createRect">createRect()</a></dt>
<dd><p>Creates a rectangle path with optional rounded corners</p>
</dd>
<dt><a href="#createPolyline">createPolyline()</a></dt>
<dd><p>Creates a polyline from an array of coordinates [x1,y1,x2,y2,...]</p>
</dd>
<dt><a href="#createPolygon">createPolygon()</a></dt>
<dd><p>Creates a closed polygon from an array of coordinates</p>
</dd>
<dt><a href="#REMOVE_COLLINEAR">REMOVE_COLLINEAR(commands)</a> ⇒</dt>
<dd><p>Process a path and remove collinear points</p>
</dd>
<dt><a href="#REVERSE_PATH">REVERSE_PATH(commands, preserveSubpathOrder)</a> ⇒</dt>
<dd><p>Reverses the order of path commands to go from end to start
IMPORTANT: This function expects absolute commands as input.
It doesn&#39;t convert relative to absolute - use SVGPathDataTransformer.TO_ABS() first if needed.</p>
</dd>
</dl>

<a name="annotateArcCommand"></a>

## annotateArcCommand()
https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
Fixes rX and rY.
Ensures lArcFlag and sweepFlag are 0 or 1
Adds center coordinates: command.cX, command.cY (relative or absolute, depending on command.relative)
Adds start and end arc parameters (in degrees): command.phi1, command.phi2; phi1 < phi2 iff. c.sweepFlag == true

**Kind**: global function  
<a name="intersectionUnitCircleLine"></a>

## intersectionUnitCircleLine()
Solves a quadratic system of equations of the form
     a * x + b * y = c
     x² + y² = 1
This can be understood as the intersection of the unit circle with a line.
     => y = (c - a x) / b
     => x² + (c - a x)² / b² = 1
     => x² b² + c² - 2 c a x + a² x² = b²
     => (a² + b²) x² - 2 a c x + (c² - b²) = 0

**Kind**: global function  
<a name="arePointsCollinear"></a>

## arePointsCollinear(p1, p2, p3) ⇒
Determines if three points are collinear (lie on the same straight line)
and the middle point is on the line segment between the first and third points

**Kind**: global function  
**Returns**: true if the points are collinear and p2 is on the segment p1-p3  

| Param | Description |
| --- | --- |
| p1 | First point [x, y] |
| p2 | Middle point that might be removed |
| p3 | Last point [x, y] |

<a name="createEllipse"></a>

## createEllipse()
Creates an ellipse path centered at (cx,cy) with radii rx and ry

**Kind**: global function  
<a name="createRect"></a>

## createRect()
Creates a rectangle path with optional rounded corners

**Kind**: global function  
<a name="createPolyline"></a>

## createPolyline()
Creates a polyline from an array of coordinates [x1,y1,x2,y2,...]

**Kind**: global function  
<a name="createPolygon"></a>

## createPolygon()
Creates a closed polygon from an array of coordinates

**Kind**: global function  
<a name="REMOVE_COLLINEAR"></a>

## REMOVE\_COLLINEAR(commands) ⇒
Process a path and remove collinear points

**Kind**: global function  
**Returns**: New array with collinear points removed  

| Param | Description |
| --- | --- |
| commands | Array of SVG path commands to process (must be absolute) |

<a name="REVERSE_PATH"></a>

## REVERSE\_PATH(commands, preserveSubpathOrder) ⇒
Reverses the order of path commands to go from end to start
IMPORTANT: This function expects absolute commands as input.
It doesn't convert relative to absolute - use SVGPathDataTransformer.TO_ABS() first if needed.

**Kind**: global function  
**Returns**: New SVG commands in reverse order with absolute coordinates  

| Param | Description |
| --- | --- |
| commands | SVG path commands in absolute form to reverse |
| preserveSubpathOrder | If true, keeps subpaths in their original order |

