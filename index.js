// 设置初始位置
let ResizerKeysList = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
let RotaterKeysList = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
// let RotaterKeysList = ['nw', 'ne', 'se', 'sw']
let TotalEventKeysList = ['drag', 'rotate', ...ResizerKeysList]

// defaultRotaterIconPath 
let defaultRotaterIconPath = './icons/default-rotater-icon.svg';

function initTargetContainerMoveRoateResize(objectLabelID, initialParameters) {
    let objectLabel = document.querySelector(`#${objectLabelID}`)
    if(objectLabel){
        // 根据是否具有特定的属性来启动对应事件
        // 绑定事件
        let {moverAvailable,rotaterAvailable,resizerAvailable,rotatersIconPath,...MoveResizeRotateParameters} = initialParameters
        // console.log(moverAvailable===undefined)

        InitialContainerAllParameters(objectLabel, MoveResizeRotateParameters)
        AddMoverToTargetContainer(objectLabel,moverAvailable)
        let toRotateKeysList = FilterAvailableRotaterAndResizerList(rotaterAvailable,RotaterKeysList)
        AddRotaterToTargetContainer(objectLabel,toRotateKeysList,rotatersIconPath)
        let toResizeKeysList = FilterAvailableRotaterAndResizerList(resizerAvailable,ResizerKeysList)
        AddResizerToTargetContainer(objectLabel,toResizeKeysList)

        return objectLabel
    }else{
        throw new Error("target Label not existed!")
    }
}


function FilterAvailableRotaterAndResizerList(rotaterOrResizerAvailable,RotaterOrResizerKeysList){
    if (rotaterOrResizerAvailable && rotaterOrResizerAvailable.length > 0 ) {
        let toRotaterOrResizerAvailable = [...new Set(rotaterOrResizerAvailable)]
        for(let key of toRotaterOrResizerAvailable){
            if(RotaterOrResizerKeysList.indexOf(key.trim())===-1){
                throw new Error(`invalid rotater config parameters: ${key},the valid options are only the items of {${RotaterOrResizerKeysList}}`)
            }
        }
        return toRotaterOrResizerAvailable
    }else{
        return null
    }
}


function InitialContainerAllParameters(objectLabel, MoveResizeRotateParameters) {
    let OriginalMoveResizeRotateParameters = {
        sx: 1,
        sy: 1,
        diff: { x: 0, y: 0 },
        lastPointermove: { x: 0, y: 0 },
        vertexOfRotate: {},
        currentPoint: { x: 0, y: 0 },
        origin: { x: 0, y: 0 }
    }
    objectLabel.OriginalMoveResizeRotateParameters = OriginalMoveResizeRotateParameters

    // 必要参数
    let computedStyle = window.getComputedStyle(objectLabel);
    let stringWidth = computedStyle.getPropertyValue('width').match(/\d+/g)[0]
    let stringHeight = computedStyle.getPropertyValue('height').match(/\d+/g)[0]
    let defaultWidth = Number(stringWidth)? Number(stringWidth) : 0 ;
    let defaultHeight = Number(stringHeight) ? Number(stringHeight) : 0;
    let matrix = new DOMMatrix(computedStyle['transform'])
    let defaultTranslateX = matrix.e 
    let defaultTranslateY = matrix.f
    
    // 获取旋转角度（弧度）
    let defaultRotateAngle = Math.atan2(matrix.b, matrix.a);
    // 将弧度转换为度数
    let rotateInDegrees = defaultRotateAngle * (180 / Math.PI);
    let boxParameters = {
        x: defaultTranslateX,
        y: defaultTranslateY,
        rect: null,
        width: defaultWidth,
        height: defaultHeight,
        rotate: rotateInDegrees,
        scalePercent: 100,
        scaleRotater:true,
        scaleResizer:true,
        // moverAvailable,rotaterAvailable,resizerAvailable,rotatersIconPath,
    };
    if (!MoveResizeRotateParameters) {
        objectLabel.MoveResizeRotateParameters = boxParameters
    } else {
        for (let key in boxParameters) {
            if (!MoveResizeRotateParameters[key]) {
                MoveResizeRotateParameters[key] = boxParameters[key]
            }
        }
        objectLabel.MoveResizeRotateParameters = MoveResizeRotateParameters
    }
    SetTargetContainerStyle(objectLabel)
}

// 设置最终样式
function SetTargetContainerStyle(objectLabel) {
    let {scaleRotater,scaleResizer,...finalParameters} = objectLabel.MoveResizeRotateParameters
    objectLabel.style.width = finalParameters.width + 'px'
    objectLabel.style.height = finalParameters.height + 'px'
    if (finalParameters.scalePercent) {
        if(finalParameters.scalePercent>0){
            objectLabel.style.transform = `translate3d(${finalParameters.x}px,${finalParameters.y}px,0px)  rotate(${finalParameters.rotate}deg) scale(${finalParameters.scalePercent / 100}) `
            let anti_scaleParameters = `scale(${100 / finalParameters.scalePercent})`
            let rotateDomList = objectLabel.querySelectorAll('.rotate')
            let resizeDomList = objectLabel.querySelectorAll('.point')
            ScaledRotaterAndResizer(rotateDomList,anti_scaleParameters,scaleRotater)
            ScaledRotaterAndResizer(resizeDomList,anti_scaleParameters,scaleResizer)
        }else{
            throw new Error(`parameters of {scalePercent} must greater than 0! but current value is ${finalParameters.scalePercent}, please pick a valid  scale values`)
        }  
    } 
}

function ScaledRotaterAndResizer(domList,scaleParameters,ScaledDom){
    if(domList && !ScaledDom){
        for (let dom of domList) {
            dom.style.transform = scaleParameters
        }
    }
}

function AddMoverToTargetContainer(objectLabel,moverAvailable) {
    if (moverAvailable){
        BindMoveToTargetContainer(objectLabel)
    }
}

function AddRotaterToTargetContainer(objectLabel,toRotateKeysList,rotateIconPath) {
    let ValidRotateIconPath = rotateIconPath == null ? defaultRotaterIconPath:rotateIconPath
    for (let key of RotaterKeysList) {
        let rotater = document.createElement('div')
        // rotater.addClass(`rotate   rotate-${key}`)
        rotater.classList.add(`rotate`, `rotate-${key}`)
        // rotate icon
        let rotateIconLabel = document.createElement('img')
        rotateIconLabel.className = 'rotateImage'
        rotateIconLabel.src = ValidRotateIconPath
        rotater.appendChild(rotateIconLabel) 
        // value
        let rotateValueContainer = document.createElement('div')
        rotateValueContainer.classList.add('rotateValueContainer')
        // show roatete degree
        let rotateValue = document.createElement('div')
        rotateValue.classList.add('rotateValue')
        rotateValue.innerText = '0' // default 0
        // show unit of rotate
        let roateUnit = document.createElement('span')
        roateUnit.innerText = '。'
        roateUnit.classList.add('roateUnit')
        rotateValueContainer.append(rotateValue)
        rotateValueContainer.append(roateUnit)
        rotater.append(rotateValueContainer)
        objectLabel.append(rotater)
        BindRotateToRotater(rotater)
        ShowTargetResizerOrRotater(rotater,key,toRotateKeysList)
    }
}

function AddResizerToTargetContainer(objectLabel,toResizeKeysList) {
    for (let key of ResizerKeysList) {
        let resizer = document.createElement('span')
        resizer.classList.add(`point`, `point-${key}`)
        resizer.dataset.key = key
        objectLabel.append(resizer)
        BindResizeToResizer(resizer)
        ShowTargetResizerOrRotater(resizer,key,toResizeKeysList,resizer)
    }
    getCursor(objectLabel);
}


function ShowTargetResizerOrRotater(resizerOrRotater,key,TargetKeysList){
    if(TargetKeysList && TargetKeysList.indexOf(key)>-1){
        resizerOrRotater.style.display = 'block'
    }else{
        resizerOrRotater.style.display = 'none'
    }
}



function BindMoveToTargetContainer(objectLabel) {
    objectLabel.dataset.key = TotalEventKeysList[0]
    objectLabel.addEventListener('pointerdown', TargetContainerPointDown)
}

function BindRotateToRotater(rotater) {
    rotater.dataset.key = TotalEventKeysList[1]
    rotater.addEventListener('pointerdown', TargetContainerPointDown)
}

function BindResizeToResizer(resizer) {
    resizer.addEventListener('pointerdown', TargetContainerPointDown)
}

function TargetContainerPointDown(e) {
    e.stopPropagation() // 避免冒泡
    let key = this.dataset.key
    if (TotalEventKeysList.indexOf(key) > -1) {
        this.setPointerCapture(e.pointerId);
        let parentContainer = GetParentContainer(this)
        let originalInfrom = parentContainer.OriginalMoveResizeRotateParameters
        let box = parentContainer.MoveResizeRotateParameters
        let lastPointermove = originalInfrom.lastPointermove
        let currentPoint = originalInfrom.currentPoint
        lastPointermove.x = e.clientX;
        lastPointermove.y = e.clientY;
        box.rect = parentContainer.getBoundingClientRect();
        getVertexOfRotate(parentContainer);
        let vertexOfRotate = originalInfrom.vertexOfRotate
        if (ResizerKeysList.indexOf(key) > -1) {
            currentPoint.x = vertexOfRotate[key].x;
            currentPoint.y = vertexOfRotate[key].y;
        }
        originalInfrom.sx = box.sx;
        originalInfrom.sy = box.sy;
        if (key == TotalEventKeysList[1]) { 
            let rotateValueContainer = this.querySelector('.rotateValueContainer')
            rotateValueContainer.style.display = 'block'
        }
        this.removeEventListener('pointermove', TargetContainerPointMove)
        this.addEventListener('pointermove', TargetContainerPointMove)
        this.addEventListener('pointerup', TargetContainerPointUp)
        this.addEventListener('pointercancel', TargetContainerPointCancel)
    }
}

function TargetContainerPointMove(e) {
    e.stopPropagation()
    let key = this.dataset.key
    if (TotalEventKeysList.indexOf(key) > -1) {
        const current = { x: e.clientX, y: e.clientY };
        let parentContainer = GetParentContainer(this)
        let originalInfrom = parentContainer.OriginalMoveResizeRotateParameters
        let diff = originalInfrom.diff
        let currentPoint = originalInfrom.currentPoint
        let lastPointermove = originalInfrom.lastPointermove
        let box = parentContainer.MoveResizeRotateParameters

        diff.x = current.x - lastPointermove.x;
        diff.y = current.y - lastPointermove.y;
        if (ResizerKeysList.indexOf(key) > -1) {
            currentPoint.x += diff.x;
            currentPoint.y += diff.y;
        }
        action[key](e);
        lastPointermove.x = current.x;
        lastPointermove.y = current.y;
        if (key == TotalEventKeysList[1]) {  // rotate
            let roateterValue = this.querySelector('.rotateValue')
            roateterValue.innerText = parseInt(box.rotate)
        }
        SetTargetContainerStyle(parentContainer)
        e.preventDefault();
    }

}


function TargetContainerPointUp(e) {
    e.stopPropagation()
    releaseResource(this)
    this.releasePointerCapture(e.pointerId);
}

function TargetContainerPointCancel(e) {
    e.stopPropagation()
    releaseResource(this)
    this.releasePointerCapture(e.pointerId);
}

function releaseResource(objectlabel) {
    objectlabel.removeEventListener('pointermove', TargetContainerPointMove)
    if (objectlabel.dataset.key == TotalEventKeysList[1]) {
        let parentContainer = objectlabel.parentNode
        getCursor(parentContainer);
        let rotateValueContainer = objectlabel.querySelector('.rotateValueContainer')
        rotateValueContainer.style.display = 'none'
    }
    objectlabel.removeEventListener('pointerup', TargetContainerPointUp)
    objectlabel.removeEventListener('pointercancel', TargetContainerPointCancel)
}


function GetParentContainer(objectLabel) {
    let key = objectLabel.dataset.key
    let parentContainer = objectLabel
    if (key != TotalEventKeysList[0]) {
        parentContainer = objectLabel.parentNode
    }
    return parentContainer
}


// 旋转角度
function getAngle(a, b) {
    const x = a.x - b.x
    const y = a.y - b.y;
    return 180 * Math.atan2(y, x) / Math.PI;
}
// 点绕点旋转公式
function calcRotate(a, b, angle) {
    const x = (a.x - b.x) * Math.cos(angle * Math.PI / 180) - (a.y - b.y) * Math.sin(angle * Math.PI / 180) + b.x
    const y = (a.x - b.x) * Math.sin(angle * Math.PI / 180) + (a.y - b.y) * Math.cos(angle * Math.PI / 180) + b.y
    return { x: x, y: y };
}
// 获取旋转后顶点坐标
function getVertexOfRotate(parentContainer) {
    // 变换原点坐标
    let originalInfrom = parentContainer.OriginalMoveResizeRotateParameters
    let origin = originalInfrom.origin
    let box = parentContainer.MoveResizeRotateParameters
    origin.x = box.x + box.width * 0.5;
    origin.y = box.y + box.height * 0.5;
    // 矩形旋转前8个点坐标
    const vertex = {
        nw: { x: box.x, y: box.y },
        n: { x: box.x + box.width * 0.5, y: box.y },
        ne: { x: box.x + box.width, y: box.y },
        e: { x: box.x + box.width, y: box.y + box.height * 0.5 },
        se: { x: box.x + box.width, y: box.y + box.height },
        s: { x: box.x + box.width * 0.5, y: box.y + box.height },
        sw: { x: box.x, y: box.y + box.height },
        w: { x: box.x, y: box.y + box.height * 0.5 }
    }
    // 矩形旋转后8个点坐标
    parentContainer.OriginalMoveResizeRotateParameters.vertexOfRotate = {
        nw: calcRotate(vertex.nw, origin, box.rotate),
        n: calcRotate(vertex.n, origin, box.rotate),
        ne: calcRotate(vertex.ne, origin, box.rotate),
        e: calcRotate(vertex.e, origin, box.rotate),
        se: calcRotate(vertex.se, origin, box.rotate),
        s: calcRotate(vertex.s, origin, box.rotate),
        sw: calcRotate(vertex.sw, origin, box.rotate),
        w: calcRotate(vertex.w, origin, box.rotate)
    }
}
// 获取两点中心坐标
function getCenter(a, b) {
    const x = (a.x + b.x) / 2 ;
    const y = (a.y + b.y) / 2 ;
    return { x: x, y: y };
}
// 两点距离
function getDistance(a, b) {
    const x = a.x - b.x;
    const y = a.y - b.y;
    return Math.hypot(x, y); // Math.sqrt(x * x + y * y);
}
// 功能函数
const action = {
    drag: function (event) {
        let parentContainer = GetParentContainer(event.target)
        let box = parentContainer.MoveResizeRotateParameters
        let diff = parentContainer.OriginalMoveResizeRotateParameters.diff
        box.x += diff.x;
        box.y += diff.y;
    },

    n: function (event) {
        // 拖动边点的计算方式
        // 1.鼠标按下时获取当前点击的边点的坐标
        // 2.鼠标移动时更新边点坐标，同时根据旋转角度计算出未旋转时边点的坐标
        // 3.利用未旋转时边点的y坐标和按下时边点的x坐标组合，得到图形拉伸后正在拖拽的边点坐标
        // 4.根据对称点计算出中心坐标后计算出高度即可
        let { currentPoint, vertexOfRotate, box, sx, sy } = GetResizeParameters(event.target)
        const currentPointOfRotate = calcRotate(currentPoint, vertexOfRotate.n, -box.rotate);
        const n = { x: vertexOfRotate.n.x, y: currentPointOfRotate.y };
        const newN = calcRotate(n, vertexOfRotate.n, box.rotate);
        const c = getCenter(newN, vertexOfRotate.s);
        box.height = getDistance(newN, vertexOfRotate.s);
        box.x = c.x - box.width * 0.5;
        box.y = c.y - box.height * 0.5;
        if (box.rotate > 270 || box.rotate < 90) {
            box.sy = newN.y > vertexOfRotate.s.y ? -sy : sy;
        } else if (box.rotate === 90) {
            box.sy = newN.x > vertexOfRotate.s.x ? sy : -sy;
        } else if (box.rotate === 270) {
            box.sy = newN.x > vertexOfRotate.s.x ? -sy : sy;
        } else {
            box.sy = newN.y > vertexOfRotate.s.y ? sy : -sy;
        }
    },
    e: function (event) {
        let { currentPoint, vertexOfRotate, box, sx, sy } = GetResizeParameters(event.target)
        const currentPointOfRotate = calcRotate(currentPoint, vertexOfRotate.e, -box.rotate);
        const e = { x: currentPointOfRotate.x, y: vertexOfRotate.e.y };
        const newE = calcRotate(e, vertexOfRotate.e, box.rotate)
        const c = getCenter(newE, vertexOfRotate.w);
        box.width = getDistance(newE, vertexOfRotate.w);
        box.x = c.x - box.width * 0.5;
        box.y = c.y - box.height * 0.5;
        if (box.rotate > 270 || box.rotate < 90) {
            box.sx = newE.x > vertexOfRotate.w.x ? sx : -sx
        } else if (box.rotate === 90) {
            box.sx = newE.y > vertexOfRotate.w.y ? sx : -sx
        } else if (box.rotate === 270) {
            box.sx = newE.y > vertexOfRotate.w.y ? -sx : sx
        } else {
            box.sx = newE.x > vertexOfRotate.w.x ? -sx : sx
        }
    },
    s: function (event) {
        let { currentPoint, vertexOfRotate, box, sx, sy } = GetResizeParameters(event.target)
        const currentPointOfRotate = calcRotate(currentPoint, vertexOfRotate.s, -box.rotate);
        const s = { x: vertexOfRotate.s.x, y: currentPointOfRotate.y };
        const newS = calcRotate(s, vertexOfRotate.s, box.rotate)
        const c = getCenter(newS, vertexOfRotate.n);
        box.height = getDistance(newS, vertexOfRotate.n);
        box.x = c.x - box.width * 0.5;
        box.y = c.y - box.height * 0.5;
        if (box.rotate > 270 || box.rotate < 90) {
            box.sy = newS.y > vertexOfRotate.n.y ? sy : -sy;
        } else if (box.rotate === 90) {
            box.sy = newS.x > vertexOfRotate.n.x ? -sy : sy;
        } else if (box.rotate === 270) {
            box.sy = newS.x > vertexOfRotate.n.x ? sy : -sy;
        } else {
            box.sy = newS.y > vertexOfRotate.n.y ? -sy : sy;
        }
    },
    w: function (event) {
        let { currentPoint, vertexOfRotate, box, sx, sy } = GetResizeParameters(event.target)  
        const currentPointOfRotate = calcRotate(currentPoint, vertexOfRotate.w, -box.rotate);
        const w = { x: currentPointOfRotate.x, y: vertexOfRotate.w.y };
        const newW = calcRotate(w, vertexOfRotate.w, box.rotate)
        const c = getCenter(newW, vertexOfRotate.e);
        box.width = getDistance(newW, vertexOfRotate.e);
        box.x = c.x - box.width * 0.5;
        box.y = c.y - box.height * 0.5;
        if (box.rotate > 270 || box.rotate < 90) {
            box.sx = newW.x > vertexOfRotate.e.x ? -sx : sx
        } else if (box.rotate === 90) {
            box.sx = newW.y > vertexOfRotate.e.y ? -sx : sx
        } else if (box.rotate === 270) {
            box.sx = newW.y > vertexOfRotate.e.y ? sx : -sx
        } else {
            box.sx = newW.x > vertexOfRotate.e.x ? sx : -sx
        }
    },
    nw: function (event) {
        // 拖动顶点的计算方式
        // 1.鼠标按下时获取当前点击的顶点的坐标和对应的对称点坐标。通俗一点来讲就是，比如正在拖拽的顶点是左上角，则其对称点是右下角
        // 2.鼠标移动时更新左上角坐标，同时根据对称点坐标计算出这两点的中心坐标
        // 3.根据旋转角度和中心点计算出未旋转时左上角和对称点的坐标
        // 4.右下角坐标与左上角坐标做差，即可计算出图形宽高和当前位置
        let { currentPoint, vertexOfRotate, box, sx, sy } = GetResizeParameters(event.target)
        const c = getCenter(currentPoint, vertexOfRotate.se);
        const newNw = calcRotate(currentPoint, c, -box.rotate);
        const newSe = calcRotate(vertexOfRotate.se, c, -box.rotate);
        box.width = Math.abs(newSe.x - newNw.x);
        box.height = Math.abs(newSe.y - newNw.y);
        box.x = newNw.x < newSe.x ? newNw.x : newSe.x;
        box.y = newNw.y < newSe.y ? newNw.y : newSe.y;
        box.sx = newNw.x > newSe.x ? -sx : sx;
        box.sy = newNw.y > newSe.y ? -sy : sy;
    },
    ne: function (event) {
        let { currentPoint, vertexOfRotate, box, sx, sy } = GetResizeParameters(event.target)
        const c = getCenter(currentPoint, vertexOfRotate.sw);
        const newNe = calcRotate(currentPoint, c, -box.rotate);
        const newSw = calcRotate(vertexOfRotate.sw, c, -box.rotate);
        box.width = Math.abs(newNe.x - newSw.x);
        box.height = Math.abs(newSw.y - newNe.y);
        box.x = (newNe.x < newSw.x ? newSw.x : newNe.x) - box.width;
        box.y = newNe.y < newSw.y ? newNe.y : newSw.y;
        box.sx = newNe.x > newSw.x ? sx : -sx;
        box.sy = newNe.y > newSw.y ? -sy : sy;
    },
    se: function (event) {
        let { currentPoint, vertexOfRotate, box, sx, sy } = GetResizeParameters(event.target)
        const c = getCenter(currentPoint, vertexOfRotate.nw);
        const newSe = calcRotate(currentPoint, c, -box.rotate);
        const newNw = calcRotate(vertexOfRotate.nw, c, -box.rotate);
        box.width = Math.abs(newSe.x - newNw.x);
        box.height = Math.abs(newSe.y - newNw.y);
        box.x = newNw.x < newSe.x ? newNw.x : newSe.x;
        box.y = newNw.y < newSe.y ? newNw.y : newSe.y;
        box.sx = newSe.x > newNw.x ? sx : -sx;
        box.sy = newSe.y > newNw.y ? sy : -sy;
    },
    sw: function (event) {
        let { currentPoint, vertexOfRotate, box, sx, sy } = GetResizeParameters(event.target)

        const c = getCenter(currentPoint, vertexOfRotate.ne);
        const newSw = calcRotate(currentPoint, c, -box.rotate);
        const newNe = calcRotate(vertexOfRotate.ne, c, -box.rotate);
        box.width = Math.abs(newNe.x - newSw.x);
        box.height = Math.abs(newSw.y - newNe.y);
        box.x = (newNe.x < newSw.x ? newSw.x : newNe.x) - box.width;
        box.y = newNe.y < newSw.y ? newNe.y : newSw.y;
        box.sx = newSw.x > newNe.x ? -sx : sx;
        box.sy = newSw.y > newNe.y ? sy : -sy;
    },
    rotate: function (event) {
        let parentContainer = GetParentContainer(event.target)
        let box = parentContainer.MoveResizeRotateParameters
        let originalInfrom = parentContainer.OriginalMoveResizeRotateParameters
        let origin = originalInfrom.origin
        let lastPointermove = originalInfrom.lastPointermove
        
        // 旋转时，需要考虑到父标签的transform的translateX和translateY
        let deltaDistance  = GetTargetContainerTranslateDistance(parentContainer)
        // let currentPoint = { x: event.clientX - 200, y: event.clientY -200}
        // let newlastPointermove = {x:lastPointermove.x - 200, y:lastPointermove.y-200}
        // let scalePercent = parentContainer.MoveResizeRotateParameters.scalePercent / 100

        let newOrigin = {x:origin.x + deltaDistance.deltaX , y: origin.y + deltaDistance.deltaY}  // 修正父标签的偏移量
        // const angle = getAngle(origin, {x:event.clientX,y:event.clientY}) - getAngle(origin, lastPointermove);
        // const angle = getAngle(origin, currentPoint) - getAngle(origin, newlastPointermove);
        const angle = getAngle(newOrigin, {x:event.clientX,y:event.clientY}) - getAngle(newOrigin, lastPointermove);
        box.rotate = (box.rotate + angle + 360) % 360;
    }
}


// 考虑父标签可能会有left，top，和translate的移动
function GetTargetContainerTranslateDistance(objectLabel){
    // let computedStyle = window.getComputedStyle(objectLabel);
    // let matrix = new DOMMatrix(computedStyle['transform'])
    // let translateX = matrix.e 
    // let translateY = matrix.f
    // let left = Number( computedStyle['left'].match(/\d+/g)[0]) ? Number( computedStyle['left'].match(/\d+/g)[0]) : 0
    // let top =  Number(computedStyle['top'].match(/\d+/g)[0]) ?  Number(computedStyle['top'].match(/\d+/g)[0]) : 0 
    
    // return {
    //     deltaX: translateX + left,
    //     deltaY: translateY + top
    // }
    
    let objectLabelReact = objectLabel.parentNode.getBoundingClientRect()
    let scalePercent = objectLabel.MoveResizeRotateParameters.scalePercent /100

    return {
        deltaX: objectLabelReact.x  * scalePercent,
        deltaY: objectLabelReact.y  * scalePercent
    }


}

// 获取光标
function getCursor(objectLabel) {
    let pointDomList = objectLabel.querySelectorAll('.point')
    if (pointDomList.length > 0) {
        let box = objectLabel.MoveResizeRotateParameters
        // 八个方向
        const directionLIst = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
        // 每个点对应的初始角度
        const directionAngle = { nw: 0, n: 45, ne: 90, e: 135, se: 180, s: 225, sw: 270, w: 315 };
        // 每个范围的角度对应的光标
        const obj = {
            nw: { start: 337.5, end: 22.5 },
            n: { start: 22.5, end: 67.5 },
            ne: { start: 67.5, end: 112.5 },
            e: { start: 112.5, end: 157.5 },
            se: { start: 157.5, end: 202.5 },
            s: { start: 202.5, end: 247.5 },
            sw: { start: 247.5, end: 292.5 },
            w: { start: 292.5, end: 337.5 },
        }
        pointDomList.forEach((item, index) => {
            // 初始角度+已旋转的角度
            const angle = (directionAngle[directionLIst[index]] + box.rotate) % 360;
            for (const key in obj) {
                if (angle < 22.5 || angle >= 337.5) {
                    item.style.cursor = 'nw-resize';
                    delete obj.nw;
                    break;
                }
                if (obj[key].start <= angle && angle < obj[key].end) {
                    item.style.cursor = key + '-resize';
                    delete obj[key];
                    break;
                }
            }
        })
    }
}

function GetResizeParameters(resizer) {
    let parentContainer = GetParentContainer(resizer)
    let originalInfrom = parentContainer.OriginalMoveResizeRotateParameters
    let currentPoint = originalInfrom.currentPoint
    let vertexOfRotate = originalInfrom.vertexOfRotate
    let box = parentContainer.MoveResizeRotateParameters
    let sx = originalInfrom.sx
    let sy = originalInfrom.sy
    return { currentPoint, vertexOfRotate, box, sx, sy }
}


function ScaledTargetContainerWithParentLabel(objectLabel,neededScaledPercent) {
    if(objectLabel.parentNode){
        let box = objectLabel.MoveResizeRotateParameters
        box.scalePercent += neededScaledPercent
        SetTargetContainerStyle(objectLabel)
        // 以下是让旋转的对象不再进行缩放
        let computedStyle = window.getComputedStyle(objectLabel.parentNode);
        let matrix = new DOMMatrix(computedStyle['transform'])
        let translateX = matrix.e 
        let translateY = matrix.f
        objectLabel.parentNode.style.transform = ` translate3d(${translateX}px,${translateY}px,0px)  scale(${box.scalePercent/100})`
    }else{
        throw new Error("target Label haven't parent label")
    } 
}

function GetMoveResizeRotateParameters(objectLabel){ 
    try {   
        let MoveResizeRotateParameters = objectLabel.MoveResizeRotateParameters
        if(MoveResizeRotateParameters){
            return MoveResizeRotateParameters
        }else{
            throw new Error("target Label haven't been initial, please initial the target Container label with function 'initTargetContainerMoveRoateResize'")
        }
    }catch (error){
        console.log("error",error)
        console.log("attention:before call current function, don't forget initial target conatiner label with the function 'initTargetContainerMoveRoateResize'!")
    }
}

function SetMoveResizeRotateParameters(objectLabel,newParmeters){
    try {
        let {moverAvailable,rotaterAvailable,resizerAvailable,rotatersIconPath,...newMoveResizeRotateParameters} = newParmeters
        let MoveResizeRotateParameters = objectLabel.MoveResizeRotateParameters
        // let ResizerKeysList = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
        // let RotaterKeysList = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
        if(MoveResizeRotateParameters){
            let newParas = {
                ...MoveResizeRotateParameters,
                ...newMoveResizeRotateParameters
            }
            objectLabel.MoveResizeRotateParameters = newParas
            SetTargetContainerStyle(objectLabel)
            if(moverAvailable!==undefined){
                if(moverAvailable){
                    objectLabel.addEventListener('pointerdown', TargetContainerPointDown)  
                }else{
                    objectLabel.removeEventListener('pointerdown', TargetContainerPointDown) 
                }
            }
            ResetRotaterandResizerAvaliable(rotaterAvailable,'rotate',objectLabel)
            ResetRotaterandResizerAvaliable(resizerAvailable,'point',objectLabel)
            if(rotatersIconPath!==undefined){
                objectLabel.querySelectorAll('.rotateImage').src = rotatersIconPath
            }
        }else{
            throw new Error("target Label haven't been initial, please initial the target Container label with function 'initTargetContainerMoveRoateResize'")
        }
    }catch (error){
        console.log("error",error)
        console.log("attention:before call current function, don't forget initial target conatiner label with the function 'initTargetContainerMoveRoateResize'!")
    }
}

function ResetRotaterandResizerAvaliable(RotaterOrResizerAvaliable,classType,objectLabel){
    let availableClassType = ['rotate','point']
    let targetFilterKeysList;
    if(availableClassType.indexOf(classType) === 0){
        targetFilterKeysList = RotaterKeysList
    }else if(availableClassType.indexOf(classType) === 1) {
        targetFilterKeysList = ResizerKeysList
    }else{
        throw new Error(`in valid classType: ${classType} `)
    }
    if(RotaterOrResizerAvaliable!==undefined){
        let toRotateOrResizeKeysList = FilterAvailableRotaterAndResizerList(RotaterOrResizerAvaliable,targetFilterKeysList)
        let DomList = objectLabel.querySelectorAll(`.${classType}`)
        if(DomList && DomList.length>0){
            DomList.style.display='none'
            if(toRotateOrResizeKeysList && toRotateOrResizeKeysList.length>0){
                for(let key of toRotateOrResizeKeysList){
                    objectLabel.querySelector(`.${classType}-${key}`).style.display='block'
                }
            }
        }
    }
}




export { 
   initTargetContainerMoveRoateResize, 
   ScaledTargetContainerWithParentLabel,
   GetMoveResizeRotateParameters,
   SetMoveResizeRotateParameters,
}