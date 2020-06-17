use tui::{
    backend::TermionBackend,
    widgets::{Text, Paragraph},
    style::{Style,  Modifier},
    layout::{Alignment},
};

pub fn render(
  area: tui::layout::Rect,
  buffer: &mut tui::terminal::Frame<'_, TermionBackend<termion::screen::AlternateScreen<termion::raw::RawTerminal<std::io::Stdout>>>>,
  show_actions: bool
) {
    let commands_default = [
        Text::styled("<Up>/<Down>", Style::default().modifier(Modifier::REVERSED)),
        Text::raw(" Navigation   "),
        Text::styled("<Enter>", Style::default().modifier(Modifier::REVERSED)),
        Text::raw(" Checkout   "),
        Text::styled("<A>", Style::default().modifier(Modifier::REVERSED)),
        Text::raw(" Action   " ),
        Text::styled("<Q>", Style::default().modifier(Modifier::REVERSED)),
        Text::raw(" Exit"),
    ];

    let commands_actions = [
        Text::styled("<D>", Style::default().modifier(Modifier::REVERSED)),
        Text::raw(" Delete branch   "),
        Text::styled("<Esc>", Style::default().modifier(Modifier::REVERSED)),
        Text::raw(" Cancel"),
    ];

    let iter = {
        if !show_actions {
            commands_default.iter()
        } else {
            commands_actions.iter()
        }
    };
    let options_text = Paragraph::new(iter)
        .alignment(Alignment::Left);

    buffer.render_widget(options_text, area);
}

pub fn render_text(
  area: tui::layout::Rect,
  buffer: &mut tui::terminal::Frame<'_, TermionBackend<termion::screen::AlternateScreen<termion::raw::RawTerminal<std::io::Stdout>>>>,
  text: &str
) {
    let text_widget = [
        Text::styled(text, Style::default().modifier(Modifier::REVERSED))
    ];

    let options_text = Paragraph::new(text_widget.iter())
        .alignment(Alignment::Left);

    buffer.render_widget(options_text, area);
}