import { Signal } from "@angular/core";

interface infiniteScroll {
    isFetching: Signal<boolean>;
    hasMore: Signal<boolean>;
    onLoadMore: () => void;
    offset?: number;
}

export function useInfiniteScroll({isFetching, hasMore, onLoadMore, offset=50}:infiniteScroll){

    return (event: Event) => {
        // const target = event.target as HTMLElement;
        // const {scrollTop, scrollHeight, clientHeight} = target;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight || document.documentElement.clientHeight;   
        if (Math.ceil(scrollTop + clientHeight) >= scrollHeight - offset) {
            if (!isFetching() && hasMore()){
                onLoadMore()
            }
    }

}
}