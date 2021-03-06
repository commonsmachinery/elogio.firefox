/**
 * Created by LOGICIFY\corvis on 9/12/14.
 */
Elogio.modules.imageDecorator = function (modules) {
    'use strict';
    var self = this;
    /*
     =======================
     REQUIREMENTS
     =======================
     */
    var dom = modules.getModule('dom'),
        config = modules.getModule('config');

    /*
     =======================
     PRIVATE MEMBERS
     =======================
     */

    function buildIdForIcon(imageUuid) {
        return 'elogioico_' + imageUuid;
    }

    //handlers for content elements
    //on mouse over handler
    var onMouseOver = function () {
            self.decorate(this, document);
        },
    //on mouse out handler
        onMouseOut = function () {
            var uuid = dom.getUUIDofElement(this),
                iconElement;
            iconElement = document.getElementById(buildIdForIcon(uuid));
            if (iconElement) {
                iconElement.style.display = 'none';
            }
        };

    function buildIconElement(element) {
        var iconElement = new Image();
        iconElement.src = self.config.iconUrl;
        iconElement.width = self.config.iconWidth;
        iconElement.height = self.config.iconHeight;
        iconElement.style.position = 'absolute';
        iconElement.style.display = 'none';
        iconElement.style.zIndex = '10000';
        iconElement.style.cursor = 'pointer';
        iconElement.id = buildIdForIcon(dom.getUUIDofElement(element));
        return iconElement;
    }

    /*
     =======================
     PUBLIC MEMBERS
     =======================
     */
    this.config = config.ui.imageDecorator;

    /**
     * Draws Elogio icon on top of the given element.
     * @param element - target element
     * @param document - DOM root
     * @param callback - callback function which will act as an action handler (e.g. OnClick event of the icon).
     *                   Signature: callback(uuid)
     *                   uuid{String} - UUID of the related image
     */
    this.decorate = function (element, document, callback) {
        //mark decorated element of DOM
        element.setAttribute(config.ui.decoratedItemAttribute, '');
        var iconElement, uuid = dom.getUUIDofElement(element),
            position, iconAlreadyCreated = false;
        // Get or build icon element
        iconElement = document.getElementById(buildIdForIcon(uuid));
        if (iconElement) {
            iconAlreadyCreated = true;
        } else {
            iconElement = buildIconElement(element);
            // Append icon to the body
            document.body.appendChild(iconElement);
            // Show on mouse in
            element.addEventListener('mouseover', onMouseOver);
            // Hide icon on mouse out
            element.addEventListener('mouseout', onMouseOut);
            iconElement.addEventListener('mouseout', function () {
                this.style.display = 'none';
            });
            // Prevent bubbling of the mouseover event
            iconElement.addEventListener('mouseover', function (e) {
                e.bubble = false;
                if (iconElement.style.display === 'none') {
                    iconElement.style.display = 'block';
                }
            });
            if (callback) {
                iconElement.addEventListener('click', function () {
                    callback(uuid);
                });
            }
        }
        // Position icon on the element
        position = element.getBoundingClientRect();
        //it is scroll top position
        iconElement.style.top = (position.top + window.pageYOffset || document.documentElement.scrollTop) + 'px';
        //it is scroll left position
        iconElement.style.left = (position.left + window.pageXOffset || document.documentElement.scrollLeft) + 'px';
        // Hide element if this is very first call.
        iconElement.style.display = iconAlreadyCreated ? 'block' : 'none';
    };

    this.undecorate = function (element, document) {
        var uuid = dom.getUUIDofElement(element),
            iconElement;
        //if element has mark 'decorated' then we need to unmark it
        if (element.hasAttribute(config.ui.decoratedItemAttribute)) {
            element.removeAttribute(config.ui.decoratedItemAttribute);
        }
        iconElement = document.getElementById(buildIdForIcon(uuid));
        if (iconElement) {
            document.body.removeChild(iconElement);
        }
        //remove event listeners too
        element.removeEventListener('mouseover', onMouseOver);
        element.removeEventListener('mouseout', onMouseOut);
        // also we need to remove uuid
        element.removeAttribute(config.ui.dataAttributeName);
    };

};