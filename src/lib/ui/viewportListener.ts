export interface IntersectingElement extends Element {
  viewportIntersectionCallback?: () => any, 
}

type ViewportElement = Element|Document|undefined

/**
* Viewport Listener
* ==================================================
*/
class ViewportListener {
  private viewport?: ViewportElement;
  private observer?: IntersectionObserver;

  //
  // Init the viewport
  // ----------------------------------------------
  init(viewport?: ViewportElement) {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    this.viewport = viewport;
    this.observer = new IntersectionObserver(
      this.intersects.bind(this), 
      { root: this.viewport }
    );
  }

  //
  // Add element to watch
  // ----------------------------------------------
  add(element: IntersectingElement, callback: () => any) {
    if(!this.observer) return;
    element.viewportIntersectionCallback = callback;
    this.observer.observe(element);
  }

  //
  // Remove elements to watch
  // ----------------------------------------------
  remove(element: IntersectingElement) {
    if(!this.observer) return;
    delete element.viewportIntersectionCallback;
    this.observer.unobserve(element);
  }

  //
  // Callbacks
  // ----------------------------------------------
  intersects(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.intersectionRatio > 0) {
        const target = entry.target as IntersectingElement;
        if (target.viewportIntersectionCallback) target.viewportIntersectionCallback();
        this.remove(target);
      }
    });
    
  }

}

// Only create instance in browser environment
const instance = typeof window !== 'undefined' ? new ViewportListener() : null;
export default instance as ViewportListener;