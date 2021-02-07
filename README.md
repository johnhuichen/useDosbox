# a React Hook to run Dosbox on browser

## Quick start

1.host dosbox-sync.js and dosbox.html.mem (from the public folder) online. Both files need to be hosted in the same location.
1.host dosgame file online as well
1.install package

```shell
npm install usedosbox
or
yarn add usedosbox
```

1.in your own react component

```typescript
import React, { createRef, useEffect } from "react";
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
    gameFile: "https://example.com/path/to/gamefile.zip",
    dosboxUrl: "https://example.com/path/to/dosbox-sync.js",
  });

  useEffect(() => {
    return () => {
      stopDosbox();
    };
  }, [stopDosbox]);

  return (
    <>
      <button type="button" onClick={startDosbox}>
        Start
      </button>
      <canvas
        id="canvas"
        ref={canvasRef}
        styles={{ width: "600px", height: "400px" }}
      />
    </>
  );
}
```

## APIs

### startDosbox: () => void;

starts dosbox

### stopDosbox: () => void;

stops dosbox, recommended for page cleanup

### isDosboxLoading: boolean

true: dosbox is loading; false: dosbox is not loading

### isDosboxReady: boolean

true: dosbox is ready; false: dosbox is not ready

### loadedSize: string

how much game file buffer has been downloaded

e.g. 6kB

### totalSize: string

how large the final game file is

e.g. 104MB

### percentage: number

percentage of game file download

e.g. 50

## Can I save games?

Yes, useDosbox uses Browserfs to store game save files in browser IndexedDB.

## How can I leverage dosbox.conf to customize each game's running environment?

useDosbox will try to find dosbox.conf file in the root location of game zip file. If the dosbox.conf exists, useDosbox will load dosbox using whatever configuration it specifies.
