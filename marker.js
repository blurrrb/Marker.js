class Marker {
    constructor(color, name) {
        this.color = color
        this.name = name
        this.markNumber = -1
        this.marks = []
    }

    _getNewMark = () => {
        let newMarkNumber = ++this.markNumber
        let style = document.createElement('style')
        let className = `marker-${this.name}-${newMarkNumber}`
        style.innerHTML = `.${className} {background-color: ${this.color}}`
        document.body.appendChild(style)
        return {
            className: className,
            markNumber: newMarkNumber,
            disableHandler: () => {
                style.innerHTML = `.${className} {background-color: white}`
            },
            enableHandler: () => {
                style.innerHTML = `.${className} {background-color: ${this.color}}`
            },
            changeColor: (color) => {
                this.color = color
                style.innerHTML = `.${className} {background-color: ${this.color}}`
            }
        }
    }

    _correctOrdering(lnode, loffset, rnode, roffset) {
        let position = lnode.compareDocumentPosition(rnode)

        // position == 0 if nodes are the same
        if (!position && loffset > roffset || position === Node.DOCUMENT_POSITION_PRECEDING) {
            [lnode, loffset, rnode, roffset] = [rnode, roffset, lnode, loffset]
        }
        return [lnode, loffset, rnode, roffset] 
    }

    _markTextNode = (textNode, l = -1, r = -1, className, handler) => {
        if(textNode.nodeName != '#text') return textNode
        // console.log('mark', textNode.textContent, l, r)

        let parentNode = textNode.parentNode
        let markNode = document.createElement('mark')
        markNode.classList.add(className)
        markNode.onclick = handler
        // set class here for mark node

        if(r == -1 && l == -1) {
            markNode.appendChild(textNode.cloneNode())
            parentNode.replaceChild(markNode, textNode)
        }
        else if(r == -1) {
            markNode.appendChild(document.createTextNode(textNode.textContent.slice(l)))
            parentNode.insertBefore(document.createTextNode(textNode.textContent.slice(0, l)), textNode)
            parentNode.replaceChild(markNode, textNode)
        }
        else if(l == -1) {
            markNode.appendChild(document.createTextNode(textNode.textContent.slice(0, r)))
            let newTextNode = document.createTextNode(textNode.textContent.slice(r))
            parentNode.replaceChild(newTextNode, textNode)
            parentNode.insertBefore(markNode, newTextNode)
        }
        else {
            markNode.appendChild(document.createTextNode(textNode.textContent.slice(l, r)))
            let newLeftNode = document.createTextNode(textNode.textContent.slice(0, l))
            let newRightNode = document.createTextNode(textNode.textContent.slice(r))
            parentNode.replaceChild(newRightNode, textNode)
            parentNode.insertBefore(newLeftNode, newRightNode)
            parentNode.insertBefore(markNode, newRightNode)
        }

        // complete this
        return markNode.firstChild
    }

    _recursiveMark = (node, till, className=null, handler=null) => {
        if(node.nodeName == '#text'){
            this._markTextNode(node, -1, -1, className, handler)
        }
        else {
            let currentNode = node.firstChild
            let found = false
            while(currentNode) {
                if(currentNode === till) return true
                let sibling = currentNode.nextSibling
                found = this._recursiveMark(currentNode, till, className, handler)
                if(found) return found
                currentNode = sibling
            }
        }
        return false
    }

    markText = (lnode, loffset, rnode, roffset) => {
        [lnode, loffset, rnode, roffset] = this._correctOrdering(lnode, loffset, rnode, roffset)

        let config = this._getNewMark()
        console.log(config)
        // return
        if(lnode === rnode) {
            this._markTextNode(lnode, loffset, roffset, config.className, config.disableHandler)
        }
        else {
            lnode = this._markTextNode(lnode, loffset, -1, config.className, config.disableHandler)
            rnode = this._markTextNode(rnode, -1, roffset, config.className, config.disableHandler)
            let currentNode = lnode
            while(currentNode.parentNode) {
                let parentNode = currentNode.parentNode
                while(currentNode.nextSibling) {
                    if(this._recursiveMark(currentNode.nextSibling, rnode, config.className, config.disableHandler)) return
                    currentNode = currentNode.nextSibling   
                }
                currentNode = parentNode
            }
        }
        return {
            disableHandler: config.disableHandler,
            enableHandler: config.enableHandler,
            changeColor: config.changeColor
        }
    }

    markSelectedText = () => {
        let selection = getSelection()
        let res = this.markText(selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset)
        selection.removeAllRanges()
        return res
    }

}