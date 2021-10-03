#include "pebble.h"

#define NUM_MENU_SECTIONS 3
#define NUM_FIRST_MENU_ITEMS 3
#define NUM_SECOND_MENU_ITEMS 3
#define NUM_THIRD_MENU_ITEMS 2

static Window *s_main_window;
static MenuLayer *s_menu_layer;

static GBitmap *s_menu_icons_audio_prev;
static GBitmap *s_menu_icons_audio_next;
static GBitmap *s_menu_icons_pause;
static GBitmap *s_menu_icons_vol_up;
static GBitmap *s_menu_icons_vol_down;
static GBitmap *s_menu_icons_vol_mute;
static GBitmap *s_menu_icons_left;
static GBitmap *s_menu_icons_right;
static GBitmap *s_background_bitmap;

static char *control_audio_prev_str = "audio_prev";
static char *control_audio_next_str = "audio_next";
static char *control_audio_pause_str = "audio_pause";
static char *vol_up_str = "audio_vol_up";
static char *vol_down_str = "audio_vol_down";
static char *vol_mute_str = "audio_mute";
static char *control_left_str = "left";
static char *control_right_str = "right";


// ******************** ajax callback END ******************** //
static void inbox_received_callback(DictionaryIterator *iterator, void *context) {
  // Store incoming information
  static char answer_buffer[32];
  static char result_layer_buffer[32];

  // Read tuples for data
  Tuple *answer_tuple = dict_find(iterator, MESSAGE_KEY_ANSWER);

  // If all data is available, use it
  if(answer_tuple) {
    snprintf(answer_buffer, sizeof(answer_buffer), "%s", answer_tuple->value->cstring);
  }

  // Assemble full string and display
  snprintf(result_layer_buffer, sizeof(result_layer_buffer), "answer: %s", answer_buffer);
  APP_LOG(APP_LOG_LEVEL_ERROR, result_layer_buffer);
}
// ******************** ajax callback END ******************** //

/*
static void inbox_dropped_callback(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped!");
}

static void outbox_failed_callback(DictionaryIterator *iterator, AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Outbox send failed!");
}

static void outbox_sent_callback(DictionaryIterator *iterator, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "Outbox send success!");
}
*/

static void sendCommand (char *data) {
  static const uint32_t SOME_STRING_KEY = 0xabbababe; // key
  const uint32_t size = dict_calc_buffer_size((uint8_t)1, strlen(data) + 1);
  uint8_t buffer[size]; // Stack-allocated buffer in which to create the Dictionary

  APP_LOG(APP_LOG_LEVEL_ERROR, "Send request");

  DictionaryIterator *iter;
  app_message_outbox_begin(&iter); // Begin dictionary
  dict_write_cstring(iter, SOME_STRING_KEY, data); // Add a key-value pair
  app_message_outbox_send(); // Send the message!
}

static uint16_t menu_get_num_sections_callback(MenuLayer *menu_layer, void *data) {
  return NUM_MENU_SECTIONS;
}

static uint16_t menu_get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
  switch (section_index) {
    case 0:
      return NUM_FIRST_MENU_ITEMS;
    case 1:
      return NUM_SECOND_MENU_ITEMS;
    case 2:
      return NUM_THIRD_MENU_ITEMS;
    default:
      return 0;
  }
}

static int16_t menu_get_header_height_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
  return MENU_CELL_BASIC_HEADER_HEIGHT;
}

static void menu_draw_header_callback(GContext* ctx, const Layer *cell_layer, uint16_t section_index, void *data) {
  // Determine which section we're working with
  switch (section_index) {
    case 0:
        menu_cell_basic_header_draw(ctx, cell_layer, "Control"); // Draw title text in the section header
      break;
    case 1:
        menu_cell_basic_header_draw(ctx, cell_layer, "Volume"); // Draw title text in the section header
      break;
    case 2:
        menu_cell_basic_header_draw(ctx, cell_layer, "Other button"); // Draw title text in the section header
      break;
  }
}

static void menu_draw_row_callback(GContext* ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data) {
  // Determine which section we're going to draw in
  switch (cell_index->section) {
    case 0:
      // Use the row to specify which item we'll draw
      switch (cell_index->row) {
        case 0:
          menu_cell_basic_draw(ctx, cell_layer, "Prev", "Button \"prev\"", s_menu_icons_audio_prev); // This is a basic menu item with a title and subtitle
          break;
        case 1:
          menu_cell_basic_draw(ctx, cell_layer, "Next", "Button \"next\"", s_menu_icons_audio_next); // This is a basic menu item with a title and subtitle
          break;
        case 2:
          menu_cell_basic_draw(ctx, cell_layer, "Pause", "Button \"pause\"", s_menu_icons_pause); // This is a basic menu item with a title and subtitle
          break;
      }
      break;
    case 1:
      switch (cell_index->row) {
        case 0:
          menu_cell_basic_draw(ctx, cell_layer, "Volume Up", "Button \"vol_up\"", s_menu_icons_vol_up); // This is a basic menu item with a title and subtitle
          break;
        case 1:
          menu_cell_basic_draw(ctx, cell_layer, "Volume Down", "Button \"vol_down\"", s_menu_icons_vol_down); // This is a basic menu item with a title and subtitle
          break;
        case 2:
          menu_cell_basic_draw(ctx, cell_layer, "Volume Mute", "Button \"vol_mute\"", s_menu_icons_vol_mute); // This is a basic menu item with a title and subtitle
          break;
      }
      break;
    case 2:
      switch (cell_index->row) {
        case 0:
          menu_cell_basic_draw(ctx, cell_layer, "Left", "Button \"left\"", s_menu_icons_left); // This is a basic menu item with a title and subtitle
          break;
        case 1:
          menu_cell_basic_draw(ctx, cell_layer, "Right", "Button \"right\"", s_menu_icons_right); // This is a basic menu item with a title and subtitle
          break;
      }
      break;
  }
}

static void menu_select_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *data) {
  // Use the row to specify which item will receive the select action
  switch (cell_index->section) {
    case 0:
      // Use the row to specify which item we'll draw
      switch (cell_index->row) {
        case 0:
          sendCommand(control_audio_prev_str);
          break;
        case 1:
          sendCommand(control_audio_next_str);
          break;
        case 2:
          sendCommand(control_audio_pause_str);
          break;
      }
      break;
    case 1:
      switch (cell_index->row) {
        case 0:
          sendCommand(vol_up_str);
          break;
        case 1:
          sendCommand(vol_down_str);
          break;
        case 2:
          sendCommand(vol_mute_str);
          break;
      }
    case 2:
      switch (cell_index->row) {
        case 0:
          sendCommand(control_left_str);
          break;
        case 1:
          sendCommand(control_right_str);
          break;
      }
  }
}

#ifdef PBL_ROUND
static int16_t get_cell_height_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *callback_context) {
  if (menu_layer_is_index_selected(menu_layer, cell_index)) {
    switch (cell_index->row) {
      case 0:
        return MENU_CELL_ROUND_FOCUSED_SHORT_CELL_HEIGHT;
        break;
      default:
        return MENU_CELL_ROUND_FOCUSED_TALL_CELL_HEIGHT;
    }
  } else {
    return MENU_CELL_ROUND_UNFOCUSED_SHORT_CELL_HEIGHT;
  }
}
#endif

static void main_window_load(Window *window) {
  // Here we load the bitmap assets
  s_menu_icons_audio_prev = gbitmap_create_with_resource(RESOURCE_ID_CONTROL_AUDIO_PREV);
  s_menu_icons_audio_next = gbitmap_create_with_resource(RESOURCE_ID_CONTROL_AUDIO_NEXT);
  s_menu_icons_pause = gbitmap_create_with_resource(RESOURCE_ID_CONTROL_PAUSE);
  s_menu_icons_vol_up = gbitmap_create_with_resource(RESOURCE_ID_VOL_UP);
  s_menu_icons_vol_down = gbitmap_create_with_resource(RESOURCE_ID_VOL_DOWN);
  s_menu_icons_vol_mute = gbitmap_create_with_resource(RESOURCE_ID_VOL_MUTE);
  s_menu_icons_left = gbitmap_create_with_resource(RESOURCE_ID_CONTROL_LEFT);
  s_menu_icons_right = gbitmap_create_with_resource(RESOURCE_ID_CONTROL_RIGHT);

  // Now we prepare to initialize the menu layer
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_frame(window_layer);

  // Create the menu layer
  s_menu_layer = menu_layer_create(bounds);
  menu_layer_set_callbacks(s_menu_layer, NULL, (MenuLayerCallbacks){
    .get_num_sections = menu_get_num_sections_callback,
    .get_num_rows = menu_get_num_rows_callback,
    .get_header_height = PBL_IF_RECT_ELSE(menu_get_header_height_callback, NULL),
    .draw_header = PBL_IF_RECT_ELSE(menu_draw_header_callback, NULL),
    .draw_row = menu_draw_row_callback,
    .select_click = menu_select_callback,
    .get_cell_height = PBL_IF_ROUND_ELSE(get_cell_height_callback, NULL),
  });

  // Bind the menu layer's click config provider to the window for interactivity
  menu_layer_set_click_config_onto_window(s_menu_layer, window);

  layer_add_child(window_layer, menu_layer_get_layer(s_menu_layer));
}

static void main_window_unload(Window *window) {
  // Destroy the menu layer
  menu_layer_destroy(s_menu_layer);

  // Cleanup the menu icons
  gbitmap_destroy(s_menu_icons_audio_prev);
  gbitmap_destroy(s_menu_icons_audio_next);
  gbitmap_destroy(s_menu_icons_pause);
  gbitmap_destroy(s_menu_icons_vol_up);
  gbitmap_destroy(s_menu_icons_vol_down);
  gbitmap_destroy(s_menu_icons_vol_mute);
  gbitmap_destroy(s_menu_icons_left);
  gbitmap_destroy(s_menu_icons_right);
}

static void init() {
  s_main_window = window_create();
  window_set_window_handlers(s_main_window, (WindowHandlers) {
    .load = main_window_load,
    .unload = main_window_unload,
  });
  window_stack_push(s_main_window, true);

  // Register callbacks
  app_message_register_inbox_received(inbox_received_callback);
  /*
  app_message_register_inbox_dropped(inbox_dropped_callback);
  app_message_register_outbox_failed(outbox_failed_callback);
  app_message_register_outbox_sent(outbox_sent_callback);
  */

  // Open AppMessage
  const int inbox_size = 128;
  const int outbox_size = 128;
  app_message_open(inbox_size, outbox_size);
}

static void deinit() {
  window_destroy(s_main_window);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}
