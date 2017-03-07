module.exports = function(grunt) {

    // Chargement de toutes les tâches contenues dans le package.json
    require('load-grunt-tasks')(grunt);

    grunt.config.init({

        // useminPrepare : pour préparer les fichiers à concaténer / minifier dans le index.html
        useminPrepare: {
            html: 'www/index.html',
            options: {
                dest: 'docs'
            }
        },

        usemin:{
            html:['docs/index.html']
        },

        copy:{
            html: {
                src: 'www/index.html', dest: 'docs/index.html'
            },
            img: {
                expand: true,
                flatten: true,
                src: 'www/img/*', dest: 'docs/img/'
            },
            views: {
                expand: true,
                flatten : true,
                src: 'www/views/*', dest: 'docs/views'
            }
        },

        clean : {
            before: ['.tmp','docs/*'],
            after: ['.tmp']
        },

        connect: {
            server: {
                options: {
                    hostname: 'localhost',
                    port: 8080,
                    base: 'www',
                    livereload: true,
                    open : true
                }
            }
        },

        watch: {
            taskName: {
                options: {
                    livereload: true
                },
                files: [
                    "www/**"
                ]
            }
        }
    });

    // Build
    grunt.registerTask('build',[
        'clean:before',
        'copy:html',
        'copy:img',
        'copy:views',
        'useminPrepare',
        'concat',
        'uglify',
        'cssmin',
        'usemin',
        'clean:after'
    ]);

    // Serve with livereload
    grunt.registerTask('serve', ['connect', 'watch']);
};