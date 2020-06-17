use tui::{
    backend::TermionBackend,
    widgets::{Text, Paragraph},
    style::{Style, Modifier, Color},
    layout::{Alignment},
};

pub fn render(
  area: tui::layout::Rect,
  buffer: &mut tui::terminal::Frame<'_, TermionBackend<termion::screen::AlternateScreen<termion::raw::RawTerminal<std::io::Stdout>>>>,
  show_actions: bool
) {
    let style_inverse: tui::style::Style = Style::default().modifier(Modifier::REVERSED);
    let style_inverse_light: tui::style::Style = Style::default().modifier(Modifier::REVERSED).bg(Color::Gray);

    let commands_default = [
        Text::styled("↑/↓", style_inverse_light),
        Text::styled(": Navigation, ", style_inverse),
        Text::styled("<Enter>", style_inverse_light),
        Text::styled(": Checkout, ", style_inverse),
        Text::styled("<A>", style_inverse_light),
        Text::styled(": Action, ", style_inverse),
        Text::styled("<Q>", style_inverse_light),
        Text::styled(": Exit", style_inverse),
    ];

    let commands_actions = [
        Text::styled("<D>", style_inverse_light),
        Text::styled(": Delete branch, ", style_inverse),
        Text::styled("<Esc>", style_inverse_light),
        Text::styled(": Cancel", style_inverse),
    ];

    let iter = {
        if !show_actions {
            commands_default.iter()
        } else {
            commands_actions.iter()
        }
    };
    let options_text = Paragraph::new(iter)
        .style(Style::default().bg(Color::LightBlue))
        .alignment(Alignment::Left);

    buffer.render_widget(options_text, area);
}

pub fn render_text(
  area: tui::layout::Rect,
  buffer: &mut tui::terminal::Frame<'_, TermionBackend<termion::screen::AlternateScreen<termion::raw::RawTerminal<std::io::Stdout>>>>,
  text: &str
) {
    let style_inverse: tui::style::Style = Style::default().modifier(Modifier::REVERSED);

    let text_widget = [
        Text::styled(text, style_inverse)
    ];

    let options_text = Paragraph::new(text_widget.iter())
        .style(Style::default().bg(Color::LightBlue))
        .alignment(Alignment::Left);

    buffer.render_widget(options_text, area);
}