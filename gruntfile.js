module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        distDir: "dist",
        buildDir: "build",

        "clean": {
            src: ["<%= buildDir%>" , "<%= distDir %>"]
        },

        "mozilla-addon-sdk": {
            "1_17": {
                options: {
                    revision: "1.17"
                }
            }
        },

        "mozilla-cfx": {
            "stable": {
                options: {
                    "mozilla-addon-sdk": "1_17",
                    extension_dir: "elogio-firefox",
                    command: "run"
                }
            }
        },

        "mozilla-cfx-xpi": {
            "stable": {
                options: {
                    "mozilla-addon-sdk": "1_17",
                    extension_dir: "<%=buildDir%>",
                    dist_dir: "dist"
                }
            }
        },

        jshint: {
            contentScript: {
                src: [
                    './elogio-firefox/data/**/*.js'
                ],
                options: {
                    jshintrc: './elogio-firefox/data/.jshintrc'
                }
            },

            chrome: {
                src: [
                    './lib/**/*.js'
                ],
                options: {
                    jshintrc: './elogio-firefox/lib/.jshintrc'
                }
            }
        },

        uglify: {
            minify: {
                options: {
                    mangle: true,
                    compress: true,
                    preserveComments: false,
                    beautify: false},
                src: ["**/*.js"],
                cwd: "elogio-firefox/",
                dest: "<%= buildDir%>/",
                expand: true
            },
            beautify: {
                options: {
                    mangle: false,
                    compress: false,
                    preserveComments: true,
                    beautify: true
                },
                src: ["**/*.js"],
                cwd: "elogio-firefox/",
                dest: "<%= buildDir%>/",
                expand: true
            },
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            }
        },

        copy: {
            resourcesWithoutJS: {
                src: ["**", "!**/*.js"],
                cwd: "elogio-firefox/",
                dest: "<%= buildDir%>/",
                expand: true
            }
        }

    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mozilla-addon-sdk');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');


    /**
     * Helper tasks.
     */
    grunt.registerTask('lint', ['jshint:chrome', 'jshint:contentScript']);

    /**
     * End-user tasks.
     *
     * These are used to build, run and test the product.
     */
    grunt.registerTask('run', [
        'mozilla-addon-sdk',
        'mozilla-cfx']);

    grunt.registerTask('dist-debug', [
        'clean',
        'lint',
        'copy:resourcesWithoutJS',
        'uglify:beautify',
        'mozilla-addon-sdk',
        'mozilla-cfx-xpi']);

    grunt.registerTask('dist-minified', [
        'clean',
        'lint',
        'copy:resourcesWithoutJS',
        'uglify:minify',
        'mozilla-addon-sdk',
        'mozilla-cfx-xpi']);
};