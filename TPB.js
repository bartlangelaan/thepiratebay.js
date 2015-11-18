"use strict";

(function(){
    function TPB(){

        if(!$){
            console.error("jQuery is not defined. \n Include jquery.js before tpb.js to fix this.")
        }

        this.ORDER = {
            NAME: {DSC: 1, ASC: 2},
            DATE: {DSC: 3, ASC: 4},
            SIZE: {DSC: 5, ASC: 6},
            SEEDS: {DSC: 7, ASC: 8},
            LEECHERS: {DSC: 9, ASC: 10}
        };

        this.defaults = {
            domain: "https://thepiratebay.se",
            proxy: "https://crossorigin.me/",
            category: 0,
            page: 0,
            order: this.ORDER.SEEDS.DSC
        };




        function parseTorrentPage(rawData){
            return $(rawData).find("table#searchResult tr:has(a.detLink)").map(function(){
                var $this = $(this);
                return {
                    // Name of the torrent
                    name: $this.find('a.detLink').text(),

                    // Upload date / time
                    // TODO: Convert to datetime
                    uploaded: $this.find('font').text().match(/Uploaded\s(?:<b>)?(.+?)(?:<\/b>)?,/)[1],

                    // Size of the torrent
                    // TODO: Convert to megabyte int
                    size: $this.find('font').text().match(/Size (.+?),/)[1],

                    // Number of seeders
                    seeders: parseInt($this.find('td[align="right"]').first().text()),

                    // Number of leechers
                    leechers: parseInt($this.find('td[align="right"]').next().text()),

                    // Id of the torrent
                    id: parseInt($this.find('div.detName a').attr('href').match(/\/torrent\/(\d+)/)[1]),

                    // The magnet URI of the torrent
                    magnet: $this.find('a[title="Download this torrent using magnet"]').attr('href'),

                    // The uploader of the torrent
                    uploader: $this.find('font .detDesc').text(),

                    // TODO: Status of the uploader (Trusted / VIP)
                    uploaderStatus: undefined,

                    // The category of the torrent
                    category: parseInt($this.find('center a').first().attr('href').match(/\/browse\/(\d+)/)[1]),

                    // The subcategory of the torrent
                    subcategory: parseInt($this.find('center a').last().attr('href').match(/\/browse\/(\d+)/)[1])
                };
            });
        }

        this.API = function(url, options){
            var opt = $.extend({}, this.defaults, options);
            var promise = $.Deferred();
            $.get(opt.proxy + opt.domain + url)
                .done(function(data){
                    promise.resolve(parseTorrentPage(data));
                })
                .fail(promise.reject);
            return promise;
        };

        this.search = function(query, options){
            var opt = $.extend({}, this.defaults, options);
            return this.API(
                '/search/'+encodeURIComponent(query)
                +'/'+opt.page
                +'/'+opt.order,
                +'/'+opt.category
                , opt);
        };

    }
    window.TPB = new TPB();
})();
