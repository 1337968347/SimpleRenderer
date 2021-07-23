interface PendIngStatus {
  total: number;
  pending: number;
  failed: number;
}

const createLoader = (rootPath: string) => {
  const pendingStatus: PendIngStatus = {
    total: 0,
    pending: 0,
    failed: 0,
  };
  // 资源加载完成回调
  let _onRendy: () => void;
  // 资源路径 与 资源对应
  const _resources = {};

  const load = (resources: string[]) => {
    for (let i = 0; i < resources.length; i++) {
      const path = resources[i];
      if (path in _resources) {
        continue;
      }
      pendingStatus.pending++;
      pendingStatus.total++;

      if (/\.(jpe?g|gif|png)$/.test(path)) {
        _loadImage(path);
      }
    }
    setTimeout(() => {
      pendingStatus.pending === 0 && _onRendy && _onRendy();
    }, 1);
  };

  const setOnRendy = (onRendy: () => void) => {
    _onRendy = onRendy;
  };

  const _loadImage = (src: string) => {
    const imageEl = document.createElement('img');
    imageEl.src = rootPath + src;
    imageEl.onload = () => {
      _success(src, imageEl);
    };
    imageEl.onerror = () => {
      _error(src, imageEl);
    };
  };

  const _success = (src: string, data: any) => {
    _resources[src] = data;
    pendingStatus.pending--;
    pendingStatus.pending === 0 && _onRendy && _onRendy();
  };

  const _error = (src: string, err: any) => {
    pendingStatus.pending--;
    pendingStatus.failed++;
    _resources[src] = null;
    err.src = src;
    throw err;
  };

  return {
    load,
    setOnRendy,
  };
};
