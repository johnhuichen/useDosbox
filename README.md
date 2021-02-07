# a React Hook to run Dosbox on browser

## Quick start

1.host dosbox-sync.js and dosbox.html.mem (from the public folder) online. Both files need to be hosted in the same location.
1.host dosgame file online as well
1.install package

```
npm install usedosbox
or
yarn add usedosbox
```

1.in your own react component

```
import React, { useRef, useEffect } from "react"
import { useDosbox } from "usedosbox";

function MyComponent() {
  const canvasRef = createRef<CanvasElement>();
  const {
    startDosbox,
    stopDosbox,
    isDosboxLoading,
    isDosboxReady,
    loadedSize,
    totalSize,
    percentage,
  } = useDosbox({
    canvasRef,
    gameFile: "https://example.com/path/to/gamefile.zip",,
    dosboxUrl: "https://example.com/path/to/dosbox-sync.js",
  });

  useEffect(() => {
    return () => {
      stopDosbox();
    };
  }, [stopDosbox]);

  return <>
    <button type="button" onClick={startDosbox}>Start</button>
    <canvas id="canvas" ref={canvasRef} styles={{ width: "600px", height: "400px" }} />
  </>
}
```

## APIs

### startDosbox

startDosbox() starts dosbox

### stopDosbox

stopDosbox() stops dosbox, recommended for page cleanup

### isDosboxLoading

boolean value giving dosbox loading state

### isDosboxReady

boolean value giving dosbox ready state

### loadedSize

a string representing how much game file buffer has been downloaded
e.g. 6kB

### totalSize

a string representing how large the final game file is
e.g. 104MB

### percentage

a number representing percentage of game file download
e.g. 50
