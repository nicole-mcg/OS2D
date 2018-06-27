# OS2D
A JavaScript game engine

## Demo
  - Demo: https://98l3w5kkmw.codesandbox.io/
  - Editable: https://codesandbox.io/s/98l3w5kkmw

## Features
- Linked Box2D (Use GameObject.ySpeed or PhysicsBody.body.getLinearVelocity().y)
- Cross-platform
- GameObject
  - Holds position and rotation
  - Components
    - Components have complete control over a GameObject in order to perform different functions
    - 
- Shapes
  - Shapes are immutable and can be reused on different components, such as ShapeRenderer and Collider
  - Currently only RegularPolygon
- Serializable to JSON
  - Whole heirarchy Game->GameObject->Component->Shape->Point
  - Can serialize event listeners to JSON
  - "Smart Serialize"
    - Will output an object {json: "", functions: ""}
      - functions contains a string that has valid JavaScript code for you to paste in your code
    - Can create variables that are reused throughout the JSON
    - Variables will compress the end result JSON as any matchin Points or Shapes are reused
    -To decompress use "os2d.deserializeVariables(deserializeJSON, functions)"
   
