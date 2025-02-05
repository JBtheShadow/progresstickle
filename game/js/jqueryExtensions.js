$.fn.extend({
    findByField: function(field) {
        return this.find(`[data-field='${field}']`);
    }
});
