[English translation](https://github.com/phantom0174/canvas-nice.js/blob/master/README-en.md)

# ✨ Canvas-nice.js

由 [canvas-nest.js](https://github.com/hustcc/canvas-nest.js/) 優化而來的網頁粒子動畫渲染器。

- [預覽網站](https://phantom0174.github.io/canvas-nice.js/)
- [可調整參數的預覽網站](https://codepen.io/phantom0174/pen/OJoXWmJ)

## 💨 **更加快速**

- 使用 chunks 作為動態物件的空間分割資料結構，擺脫 `canvas-nest` 的爆搜算法。
- 實作繪圖緩衝區，大幅提升渲染速度。

## 🎨 **更多自訂參數**

相較於 `canvas-nest.js` 的 `5` 個參數；提供多達 **`14`** 個客製化參數，讓動畫更加多變！

## 如何使用

### 套件安裝

將下列連結或是放到 html 檔案的 body 中；或是直接將 `canvas-nice.min.js` 檔案複製到本機端使用。

```html
<script defer type="text/javascript" src="https://cdn.jsdelivr.net/npm/canvas-nice.js/dist/canvas-nice.min.js"></script>
```

> 程式碼已打包且壓縮過，目前大小為 `7.22` KiB。

### 建立畫布

建立一個新的 `.js` 檔，並將自己設定的參數傳入 `CanvasNice` 中

```js
new CanvasNice({
    point_dist: 77,
    point_count: 500,
    point_size: {
        min: 1,
        max: 2
    },
    point_slow_down_rate: 0.8,
    point_color: '120,120,120',
    line_color: '120,120,120',
    line_width_multiplier: 0.5,
    max_point_speed: 2,
    zIndex: 0,
    canvas_opacity: 1,
    render_rate: 45,
    chunk_capacity: 15,
    chunk_size_constant: 0.8,
    pointer_inter_type: 0
});
```

範例請見 [index.html](https://github.com/phantom0174/canvas-nice.js/blob/master/index.html) 與 [main.js](https://github.com/phantom0174/canvas-nice.js/blob/master/main.js)

### 參數說明

以下為參數資料型態與有效範圍一覽

```text
point_dist: float (> 0)
point_count: int (>= 0)
point_size: {
    min: float (>= 0),
    max: float (>= 0)
}
max_point_speed: float (> 0)
point_slow_down_rate: float (> 0 && < 1)
point_color: 'r,g,b' (r, g, b >= 0 && <= 255)
line_color: 'r,g,b' (r, g, b >= 0 && <= 255)
line_width_multiplier: float (>= 0)
zIndex: int (any)
canvas_opacity: float (>= 0 && <= 1)
render_rate: int (> 0)
chunk_capacity: int (> 0)
chunk_size_constant: float (> 0.25)
pointer_inter_type: int (-1 / 0 / 1)
```

- `point_dist`：粒子的互動半徑（單位為像素）
- `point_count`：粒子數目，在普通配置下建議小於 `1000`
- `point_size`：粒子的最小與最大半徑，可選（`min` 與 `max` 預設值皆為 `1`）
- `max_point_speed`：粒子在一座標軸方向的每一幀最快移動速度（單位為像素）
- `point_slow_down_rate`：粒子超過最快移動速度後的速度衰減倍率
- `point_color`：粒子的顏色
- `line_color`：兩粒子間線的顏色
- `line_width_multiplier`：兩粒子間線的寬度倍數，`0` 為不顯示線（推薦 `0.5 ~ 1.5`）
- `zIndex`：畫布的 `z-index`
- `render_rate`：自訂渲染幀率，無填入則使用瀏覽器預設
- `canvas_opacity`：畫布的透明度（`1` 為不透明；`0` 為完全透明）
- `chunk_capacity`：每一個 chunk 所能容納的最高粒子數
- `chunk_size_constant`：chunk 的寬或高與粒子互動半徑的比值（大於 `1` 為無損計算，推薦 `0.8`）
- `pointer_inter_type`：粒子與游標的互動模式，共三種：

    ```text
    -1: 無互動
    0: 在游標周邊一定範圍內的粒子會完全靜止
    1: 模仿 canvas-nest.js 的互動模式，使粒子在一定範圍內來回震盪
    ````
