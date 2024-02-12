/* MAIN */


/* NAV-BAR SECTION */
const nav_bar = $(document).find('#nav-bar')[0];
$(window).on('scroll', function() {
    show_nav_bar_shadow($(window).scrollTop() > 64);
});
/* --------------- */
function show_nav_bar_shadow(visibility) {
    if (visibility) $(nav_bar).css('box-shadow', '0px 0px 20px rgba(var(--bs-body-color-rgb),0.1)');
    else $(nav_bar).css('box-shadow', 'none');
}
function show_dynamic_nav_bar(visibility) {
    const dynamic = $(nav_bar).find('.dynamic')[0];
    const svg = $(nav_bar).find('svg');
    const open_btn = $(svg)[0];
    const close_btn = $(svg)[1];
    if (visibility && dynamic.style.display === 'none') {
        $(dynamic).show(150);
        $(open_btn).hide();
        $(close_btn).show(150);
        show_nav_bar_shadow(true);
    }
    else {
        $(dynamic).hide(150);
        $(open_btn).show(150);
        $(close_btn).hide(0);
        show_nav_bar_shadow($(window).scrollTop() > 64);
    }
}
function scroll_to_section(section_id) {
    const section = $(document).find('#' + section_id)[0]
    var positionY = $(section).offset().top;
    if (section_id !== '#contacts') positionY -= 64;
    window.scrollTo(0, positionY);
    show_dynamic_nav_bar(false);
}


/* ABOUT SECTION */
function download_resume() {
    window.open('https://github.com/Merabet4mine/merabet4mine.github.io/raw/master/assets/file/Merabet%20Amine.pdf', '_blank');
}


/* PROJECTS SECTION */
function open_project(url) {
    window.open('https://www.behance.net/gallery/' + url, '_blank');
}


/* ERROR POPUP */
function open_error_popup(title, text) {
    const _popup = $(document).find('#error-popup')[0];
    const _title = $(_popup).find('.title')[0];
    const _text = $(_popup).find('.text')[0];
    $(_title).text(title);
    $(_text).text(text);
    $(_popup).show();
    const margin = (window.innerWidth - $('body').width()) + 'px';
    $('body').css('margin-right', margin);
    $('#nav-bar').css('padding-right', margin);
    $('body').css('overflow', 'hidden');
}
function close_error_popup() {
    const _popup = $(document).find('#error-popup')[0];
    $(_popup).hide();
    $('body').css('margin-right', '');
    $('#nav-bar').css('padding-right', '');
    $('body').css('overflow', '');
}