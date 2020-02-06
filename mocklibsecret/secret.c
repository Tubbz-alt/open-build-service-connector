#include <stdlib.h>
#include <string.h>

#include <glib.h>
#include <libsecret/secret.h>

#define UNUSED(var) (void)var

void secret_password_free(char *password) { UNUSED(password); }

gboolean secret_password_store_sync(const SecretSchema *schema,
                                    const gchar *collection, const gchar *label,
                                    const gchar *password,
                                    GCancellable *cancellable, GError **error,
                                    ...) {
  *error = NULL;
  UNUSED(schema);
  UNUSED(collection);
  UNUSED(label);
  UNUSED(password);
  UNUSED(cancellable);

  const char *retval = getenv("MOCK_SECRET_PASSWORD_STORE_RETVAL");

  return retval == NULL ? TRUE : strcmp(retval, "1") == 0;
}

static const char *empty_password = "";

gchar *secret_password_lookup_sync(const SecretSchema *schema,
                                   GCancellable *cancellable, GError **error,
                                   ...) {
  *error = NULL;

  UNUSED(schema);
  UNUSED(cancellable);

  const char *retval = getenv("MOCK_SECRET_PASSWORD_LOOKUP");
  return (gchar*) (retval == NULL ? empty_password : retval);
}

gboolean secret_password_clear_sync(const SecretSchema *schema,
                                    GCancellable *cancellable, GError **error,
                                    ...) {
  *error = NULL;

  UNUSED(schema);
  UNUSED(cancellable);

  const char *retval = getenv("MOCK_SECRET_PASSWORD_CLEAR_RETVAL");

  return retval == NULL ? TRUE : strcmp(retval, "1") == 0;
}

// struct secret_item {};

GList *secret_service_search_sync(SecretService *service,
                                  const SecretSchema *schema,
                                  GHashTable *attributes,
                                  SecretSearchFlags flags,
                                  GCancellable *cancellable, GError **error) {
  *error = NULL;

  UNUSED(service);
  UNUSED(schema);
  UNUSED(flags);
  UNUSED(cancellable);
  UNUSED(attributes);


  GList *l = NULL;

  GHashTable* secret_item = g_hash_table_new(NULL, NULL);
  g_hash_table_replace(secret_item,
                       (gpointer) "account",
                       (gpointer) getenv("MOCK_SECRET_PASSWORD_LOOKUP"));

  l = g_list_append(l, secret_item);
  return l;

}

GHashTable *secret_item_get_attributes(SecretItem *self) {
  return (GHashTable*) self;
}

SecretValue *secret_item_get_secret (SecretItem *self) {
  return (SecretValue*) self;
}

const gchar * secret_value_get_content_type (SecretValue *value) {
  return (const gchar*) value;
}
