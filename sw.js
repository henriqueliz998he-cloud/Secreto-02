const CACHE_NAME = "metas-016-v3-cache-2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./sw.js"
];


/* =========================================================
   INSTALAÇÃO
========================================================= */

self.addEventListener(
    "install",
    (event) => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    (cache) => {

                        return cache.addAll(
                            FILES_TO_CACHE
                        );

                    }
                )
                .then(
                    () => {

                        return self.skipWaiting();

                    }
                )

        );

    }
);


/* =========================================================
   ATIVAÇÃO
========================================================= */

self.addEventListener(
    "activate",
    (event) => {

        event.waitUntil(

            caches
                .keys()
                .then(
                    (cacheNames) => {

                        return Promise.all(

                            cacheNames
                                .filter(
                                    (cacheName) =>
                                        cacheName !==
                                        CACHE_NAME
                                )
                                .map(
                                    (cacheName) =>
                                        caches.delete(
                                            cacheName
                                        )
                                )

                        );

                    }
                )
                .then(
                    () => {

                        return self.clients.claim();

                    }
                )

        );

    }
);


/* =========================================================
   ATUALIZAÇÃO IMEDIATA
========================================================= */

self.addEventListener(
    "message",
    (event) => {

        if (
            event.data &&
            event.data.type ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);


/* =========================================================
   FUNCIONAMENTO ONLINE + OFFLINE
========================================================= */

self.addEventListener(
    "fetch",
    (event) => {

        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }


        event.respondWith(

            fetch(
                event.request
            )
                .then(
                    (networkResponse) => {

                        if (
                            networkResponse &&
                            networkResponse.status === 200
                        ) {

                            const responseClone =
                                networkResponse.clone();

                            caches
                                .open(
                                    CACHE_NAME
                                )
                                .then(
                                    (cache) => {

                                        cache.put(
                                            event.request,
                                            responseClone
                                        );

                                    }
                                );

                        }


                        return networkResponse;

                    }
                )
                .catch(
                    () => {

                        return caches.match(
                            event.request
                        )
                            .then(
                                (cachedResponse) => {

                                    if (
                                        cachedResponse
                                    ) {

                                        return cachedResponse;

                                    }


                                    return caches.match(
                                        "./index.html"
                                    );

                                }
                            );

                    }
                )

        );

    }
);
