class Marker {
    constructor(color, name) {
        this.color = color
        this.name = name
        this.markNumber = -1
    }

    _getNewMarkNumber = () => {
        return ++this.markNumber
    }

    _correctOrdering(lnode, loffset, rnode, roffset) {
        let position = lnode.compareDocumentPosition(rnode)

        // position == 0 if nodes are the same
        if (!position && loffset > roffset || position === Node.DOCUMENT_POSITION_PRECEDING) {
            [lnode, loffset, rnode, roffset] = [rnode, roffset, lnode, loffset]
        }
        return [lnode, loffset, rnode, roffset] 
    }

    _markTextNode = (textNode, l = -1, r = -1) => {
        if(textNode.nodeName != '#text') return textNode
        // console.log('mark', textNode.textContent, l, r)

        let parentNode = textNode.parentNode
        let markNode = document.createElement('mark')
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

    _recursiveMark = (node, till) => {
        console.log(node)
        if(node.nodeName == '#text'){
            this._markTextNode(node)

        }
        else {
            let currentNode = node.firstChild
            let found = false
            while(currentNode) {
                if(currentNode === till) return true
                let sibling = currentNode.nextSibling
                found = this._recursiveMark(currentNode, till)
                if(found) return found
                currentNode = sibling
            }
        }
        return false
    }

    markText = (lnode, loffset, rnode, roffset) => {
        [lnode, loffset, rnode, roffset] = this._correctOrdering(lnode, loffset, rnode, roffset)

        if(lnode === rnode) {
            this._markTextNode(lnode, loffset, roffset)
        }
        else {
            lnode = this._markTextNode(lnode, loffset, -1)
            rnode = this._markTextNode(rnode, -1, roffset)
            let currentNode = lnode
            while(currentNode.parentNode) {
                let parentNode = currentNode.parentNode
                while(currentNode.nextSibling) {
                    if(this._recursiveMark(currentNode.nextSibling, rnode)) return
                    currentNode = currentNode.nextSibling   
                }
                currentNode = parentNode
            }
        }
    }

    markSelectedText = () => {
        let selection = getSelection()
        this.markText(selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset)
        selection.removeAllRanges()
    }

}