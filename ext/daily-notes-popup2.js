/* globals jsPanel, Mousetrap, Cookies    */

var dailyNotesPopup2 =  {
  panelDNP:             undefined,
  idPanelDNP:           'jsPanelDNP',
  shortcut:             'alt+shift+,',
  
  initialize() {
    //inside popup - configure to hide window, then exit rest of initializer
    Mousetrap.unbind(this.shortcut);
    Mousetrap.bind(this.shortcut, ()=>{
      if( window != window.parent ) { 
        window.parent.document.querySelector('#'+this.idPanelDNP).style.visibility = 'hidden'
      } else { this.toggleVisible() }
      return false
    });              

    if( window != window.parent ) { return }

    var baseUrlRoamDb = `https://roamresearch.com/#/app/${window.location.href.replace('https://roamresearch.com/#/app/','').split('/')[0]}`
    this.panelDNP = jsPanel.create({
      id: this.idPanelDNP,
      header: 'auto-show-hide',
      headerControls: { smallify: 'remove', maximize: 'remove' },        
      content: `<div style="position:absolute;left:1px;top:1px;right:1px;bottom:1px;">
                <iframe src="${baseUrlRoamDb}" id="iframePanelDNP" style="top:-1px;left:-1px;width:100%;height:100%; border:0px solid white"></iframe>
                </div>` ,
      headerTitle: '<div style="font-variant: normal;position:relative;left:5px;z-index:1000;width:200px;color:white !important;padding-top:2px;">Daily Notes</div>',
      iconfont: [
        'bp3-button bp3-minimal bp3-small bp3-icon-small-minus', 
        'bp3-button bp3-minimal bp3-small bp3-icon-chevron-down',  
        'bp3-button bp3-minimal bp3-small bp3-icon-expand-all', 
        'bp3-button bp3-minimal bp3-small bp3-icon-maximize', 
        'bp3-button bp3-minimal bp3-small bp3-icon-cross'
        ],
      onwindowresize: true,
      resizeit: {  minWidth: 300, minHeight: 300, },

      contentOverflow: 'hidden',
      position: {
          my: 'right-center',
          at: 'left-center',
          of: document.body
      },
      callback: (panel)=> {
        panel.querySelector('#iframePanelDNP').onload = function(){
          var loc = Cookies.get('DNP_Parameters_Dimensions') ? JSON.parse( Cookies.get('DNP_Parameters_Dimensions') ) : ''
          var lWidth   = 500
          var lHeight  = 300
          var lPosition = 'center-bottom' 
          var lX = -10
          var lY = -10
          if( loc != '' )  {    
            lPosition = 'left-top'
            lWidth   = loc.width
            lHeight  = loc.height
            lX = loc.left
            lY = loc.top
          }
          if( lY  >=  window.innerHeight ) {
            lPosition = 'center-top' 
            lY = -10
          }
          if( lX  >=  window.innerWidth ) {
            lPosition = 'center-top' 
            lX = -10
          }
          panel.style.visibility = 'hidden'
          panel.reposition( {my: lPosition, at: lPosition, offsetX: lX, offsetY: lY })
          panel.resize( {width:lWidth, height:lHeight} )
          dailyNotesPopup2.addPanelEvents()
        }
      },
      dragit: {
         containment: [10, 10, 10,10],
      },        
      boxShadow: 4,
    })
    //customize the internal view
    setTimeout( ()=> {
      var iframe = document.getElementById('iframePanelDNP')
      var style = document.createElement('style')

      style.textContent = ` 
/*          .bp3-icon-more, .bp3-icon-menu, .bp3-icon-menu-open, .bp3-icon-graph, #buffer, .roam-sidebar-container {
             display: none !important;
          }
*/
          #buffer{
             display: none !important;
          }
          .roam-article {
            padding: 3px 20px 20px !important;
          }
          h1.rm-title-display {
            margin-top: 8px !important;
            margin-bottom: 8px !important;
            font-size:24px;
        }
      `;
      try {
        iframe.contentDocument.getElementsByClassName("bp3-icon-menu-closed")[0].click()
        simulateMouseOver(iframe.contentDocument.document.getElementsByClassName("roam-article")[0]) 
      } catch(e) {} //if on ipad, the above command fails, so go to next step      
      iframe.contentDocument.head.appendChild(style)
    },12000)
 
  },

  saveUIChanges(eventName) {
      var UIValues = {
        width:  this.panelDNP.currentData.width.replace('px','') ,
        height: this.panelDNP.currentData.height.replace('px','') ,
        left:   this.panelDNP.currentData.left.replace('px','') ,
        top:    this.panelDNP.currentData.top.replace('px','') 
      }
      Cookies.set('DNP_Parameters_Dimensions', JSON.stringify(UIValues))
  },
  
  addPanelEvents() {
    this.panelDNP.options.onbeforeclose.push( ()=> {  //close hides the window
      this.toggleVisible()
      return false
    });
    document.addEventListener('jspanelresizestop', (event)=>{ if(event.detail=='jsPanelDNP'){this.saveUIChanges('jspanelresizestop')} }, false)
    document.addEventListener('jspaneldragstop',   (event)=>{ if(event.detail=='jsPanelDNP'){this.saveUIChanges('jspaneldragstop')}   }, false)
    document.addEventListener('jspanelfronted',    (event)=>{ if(event.detail=='jsPanelDNP'){this.saveUIChanges('jspanelfronted')}    }, false)
  },
  
  toggleVisible() {
    if( dailyNotesPopup2.panelDNP.style.visibility == 'hidden' ) {
      if(dailyNotesPopup2.panelDNP.offsetLeft > window.innerWidth) {
        dailyNotesPopup2.panelDNP.offsetLeft = window.innerWidth - dailyNotesPopup2.panelDNP.style.width - 10 
      }
      if(dailyNotesPopup2.panelDNP.offsetTop+100 > window.innerHeight) {
        dailyNotesPopup2.panelDNP.offsetTop = window.innerHeight -100 
      }      
      dailyNotesPopup2.panelDNP.style.visibility = 'visible'
    } else {
      dailyNotesPopup2.panelDNP.normalize()
      dailyNotesPopup2.saveUIChanges('toggleVisible')
      dailyNotesPopup2.panelDNP.style.visibility = 'hidden'
      parent.focus()
    }
  },

}
