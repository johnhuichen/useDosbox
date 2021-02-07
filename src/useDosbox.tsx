import { useReducer, useCallback } from 'react';
import * as BrowserFS from 'browserfs';

import { noop, fetchFile, formatBytes, RequestEvent } from './utils';

interface UseDosboxProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  gameFile: string;
}

interface UseDosboxState {
  isDosboxLoading: boolean;
  isDosboxReady: boolean;
  loadedSize?: string;
  totalSize?: string;
  percentage?: number;
}

interface UseDosboxAction {
  type: string;
  loadedSize?: string;
  totalSize?: string;
  percentage?: number;
}

interface UseDosboxData extends UseDosboxState {
  startDosbox: () => void;
  stopDosbox: () => void;
}

declare global {
  interface Window {
    Module: {
      arguments: string[];
      screenIsReadOnly: boolean;
      print: (msg: string) => void;
      printErr: (msg: string) => void;
      canvas: HTMLCanvasElement;
      noInitialRun: boolean;
      locateFile: (fileName: string) => string;
      preInit: () => void;
      // eslint-disable-next-line
      preRun: any;
    };
  }
  // eslint-disable-next-line
  var FS: any;
}

const logger = (msg: string) => console.log(msg);

// TODO
// server this file and mem file over the cdn for production
const DOSBOX_JS_URL = '/dosbox-sync.js';

function getBrowserFSConfig({ gameName, zipData }: { gameName: string; zipData: Buffer }) {
  const writable = {
    fs: 'AsyncMirror',
    options: {
      sync: { fs: 'InMemory' },
      async: {
        fs: 'IndexedDB',
        options: { storeName: `gamenoir-${gameName}` },
      },
    },
  };
  const readable = {
    fs: 'MountableFileSystem',
    options: {
      '/c': {
        fs: 'ZipFS',
        options: {
          zipData,
        },
      },
    },
  };
  return {
    fs: 'OverlayFS',
    options: {
      writable,
      readable,
    },
  };
}

function browserFSCallback() {
  try {
    const fs = BrowserFS.BFSRequire('fs');
    fs.writeFileSync('/dosbox.conf', fs.readFileSync('/c/dosbox.conf'));
  } catch (error) {
    console.log('Error writing dosbox conf', error);
  }
}

function locateFile(fileName: string): string {
  return `/${fileName}`;
}

async function updateModule({
  canvas,
  gameFile,
  dispatch,
}: {
  canvas: HTMLCanvasElement;
  gameFile: string;
  dispatch: (action: UseDosboxAction) => void;
}) {
  const onProgress = (event: RequestEvent) => {
    const { total, loaded } = event;
    const percentage = Math.floor((loaded / total) * 100);

    dispatch({
      type: 'SET_LOADING_DETAILS',
      totalSize: formatBytes(total),
      loadedSize: formatBytes(loaded),
      percentage,
    });
  };
  const arrayBuffer = await fetchFile(gameFile, {
    onProgress,
    onError: noop,
  });
  const zipData = BrowserFS.BFSRequire('buffer').Buffer.from(arrayBuffer);
  const gameName = gameFile.replace(/\//, '').replace(/\.zip$/, '');
  const browserFSConfig = getBrowserFSConfig({ gameName, zipData });

  BrowserFS.configure(browserFSConfig, browserFSCallback);

  window.Module = {
    arguments: ['-conf', '/emulator/dosbox.conf'],
    screenIsReadOnly: true,
    print: logger,
    printErr: logger,
    canvas,
    noInitialRun: false,
    locateFile,
    preInit: () => {
      const BFS = new BrowserFS.EmscriptenFS();
      FS.mkdir('/emulator');
      FS.mount(BFS, { root: '/' }, '/emulator');
    },
    preRun: noop,
  };
}

function addDosboxScript() {
  const script = document.createElement('script');

  script.src = DOSBOX_JS_URL;
  script.async = true;

  document.body.appendChild(script);
}

const initialState = {
  isDosboxLoading: false,
  isDosboxReady: false,
};

function reducer(state: UseDosboxState, action: UseDosboxAction) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isDosboxLoading: true };
    case 'SET_LOADING_DETAILS':
      return {
        ...state,
        totalSize: action.totalSize,
        loadedSize: action.loadedSize,
        percentage: action.percentage,
      };
    case 'SET_READY':
      return { ...state, isDosboxLoading: false, isDosboxReady: true };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export default function useDosbox({ canvasRef, gameFile }: UseDosboxProps): UseDosboxData {
  const [state, dispatch] = useReducer(reducer, initialState);

  const startDosbox = useCallback(async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        dispatch({ type: 'SET_LOADING' });

        await updateModule({ canvas, gameFile, dispatch });
        addDosboxScript();

        dispatch({ type: 'SET_READY' });
      } catch {
        dispatch({ type: 'RESET' });
      }
    }
  }, [canvasRef, gameFile]);

  const stopDosbox = useCallback(() => {
    window.location.reload(false);
  }, []);

  return { ...state, startDosbox, stopDosbox };
}
