export interface RequestEvent extends Event {
  total: number;
  loaded: number;
}

// eslint-disable-next-line
function noop() {}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const unit = 1024;
  const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const exp = Math.floor(Math.log(bytes) / Math.log(unit));
  const size = (bytes / Math.pow(unit, exp)).toFixed(1);

  return `${size} ${units[exp]}`;
}

async function fetchFile(
  gameFile: string,
  {
    onProgress = noop,
    onError = noop,
  }: {
    onProgress: (event: RequestEvent) => void;
    onError: (event: RequestEvent) => void;
  }
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', gameFile, true);
    xhr.responseType = 'arraybuffer';

    xhr.onprogress = onProgress;

    xhr.onload = function() {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject();
      }
    };
    xhr.onerror = function(event) {
      onError(event);
      reject();
    };
    xhr.send();
  });
}

export { fetchFile, formatBytes, noop };
