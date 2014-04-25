/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!HTMLElement.insertAdjacentElement) {
    if (HTMLElement.insertAdjacentHTML) {
        HTMLElement.prototype.insertAdjacentElement = HTMLElement.prototype.insertAdjacentHTML;
    }
}
