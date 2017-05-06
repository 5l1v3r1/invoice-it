import Common from './common'
import Recipient from './recipient'
import Emitter from './emitter'
import jade from 'jade'
import path from 'path'
import i18n from '../lib/i18n'
import fs from 'fs'
import moment from 'moment'

export default class Generator extends Common {

  constructor(config) {
    super()
    this._recipient = (config.recipient) ? new Recipient(config.recipient) : new Recipient()
    this._emitter = (config.emitter) ? new Emitter(config.emitter) : new Emitter()
    this.hydrate(config.global, this.itemsToHydrate())
  }

  get template() {
    return this._template
  }

  set template(value) {
    this._template = value
  }

  get lang() {
    return (!this._lang) ? 'en' : this._lang
  }

  set lang(value) {
    this._lang = value
  }

  get id() {
    return this._id
  }

  set id(value) {
    this._id = value
  }

  get reference() {
    return this._reference
  }

  set reference(value) {
    this._reference = value
  }

  get logo() {
    return this._logo
  }

  set logo(value) {
    this._logo = value
  }

  get order_template() {
    return this._order_template
  }

  set order_template(value) {
    this._order_template = value
  }

  get invoice_template() {
    return this._invoice_template
  }

  set invoice_template(value) {
    this._invoice_template = value
  }

  get date_format() {
    return (!this._date_format) ? 'YYYY/MM/DD' : this._date_format
  }

  set date_format(value) {
    this._date_format = value
  }

  get date() {
    return (!this._date) ? moment().format(this.date_format) : this._date
  }

  set date(value) {
    if(!moment(value).isValid()) throw new Error(`Date not valid`)
    this._date = moment(value).format(this.date_format)
  }

  itemsToHydrate() {
    return ['logo', 'order_template', 'invoice_template', 'date_format']
  }

  recipient(obj) {
    if (!obj) return this._recipient
    return this._recipient.hydrate(obj, this._recipient.itemsToHydrate())
  }

  emitter(obj) {
    if (!obj) return this._emitter
    return this._emitter.hydrate(obj, this._emitter.itemsToHydrate())
  }

  _preCompileCommonTranslations() {
    return {
      logo: this.logo,
      header_date: this.date,
      table_information: i18n.__({phrase: 'table_information', locale: this.lang}),
      table_description: i18n.__({phrase: 'table_description', locale: this.lang}),
      table_tax: i18n.__({phrase: 'table_tax', locale: this.lang}),
      table_quantity: i18n.__({phrase: 'table_quantity', locale: this.lang}),
      table_price_without_taxes: i18n.__({phrase: 'table_price_without_taxes', locale: this.lang}),
      table_price_without_taxes_unit: i18n.__({phrase: 'table_price_without_taxes_unit', locale: this.lang}),
      table_note: i18n.__({phrase: 'table_note', locale: this.lang}),
      table_total_without_taxes: i18n.__({phrase: 'table_total_without_taxes', locale: this.lang}),
      table_total_taxes: i18n.__({phrase: 'table_total_taxes', locale: this.lang}),
      table_total_with_taxes: i18n.__({phrase: 'table_total_with_taxes', locale: this.lang}),
      fromto_phone: i18n.__({phrase: 'fromto_phone', locale: this.lang}),
      fromto_mail: i18n.__({phrase: 'fromto_mail', locale: this.lang}),
      footer: i18n.__({phrase: 'footer', locale: this.lang}),
      moment: moment()
    }
  }

  /**
   * @description Compile jade template to HTML
   * @param keys
   * @returns {*}
   * @private
   */
  _compile(keys) {
    let compiled = jade.compileFile(path.resolve('./static/order.jade'))
    let html = compiled(Object.assign(keys, this._preCompileCommonTranslations()))
    fs.writeFile('test.html', html) // Only for testing (during developments)
    return html
  }

  getInvoice() {
    return this._compile({
      invoice_header_title: i18n.__({phrase: 'invoice_header_title', locale: this.lang}),
      invoice_header_subject: i18n.__({phrase: 'invoice_header_subject', locale: this.lang}),
      invoice_header_reference: i18n.__({phrase: 'invoice_header_reference', locale: this.lang}),
      invoice_header_date: i18n.__({phrase: 'invoice_header_date', locale: this.lang})
    })
  }

  getOrder() {
    return this._compile({
      order_header_title: i18n.__({phrase: 'order_header_title', locale: this.lang}),
      order_header_subject: i18n.__({phrase: 'order_header_subject', locale: this.lang}),
      order_header_reference: i18n.__({phrase: 'order_header_reference', locale: this.lang}),
      order_header_date: i18n.__({phrase: 'order_header_date', locale: this.lang}),
      emitter_name: this.emitter().name,
      emitter_street_number: this.emitter().street_number,
      emitter_street_name: this.emitter().street_name,
      emitter_zip_code: this.emitter().zip_code,
      emitter_city: this.emitter().city,
      emitter_country: this.emitter().country,
      emitter_phone: this.emitter().phone,
      emitter_mail: this.emitter().mail,
      recipient_company: this.recipient().company_name,
      recipient_first_name: this.recipient().first_name,
      recipient_last_name: this.recipient().last_name,
      recipient_street_number: this.recipient().street_number,
      recipient_street_name: this.recipient().street_name,
      recipient_zip_code: this.recipient().zip_code,
      recipient_city: this.recipient().city,
      recipient_country: this.recipient().country,
      recipient_phone: this.recipient().phone,
      recipient_mail: this.recipient().mail,
      table_note_content: '',
      table_total_without_taxes_value: '3,99',
      table_total_taxes_value: '0,08',
      table_total_with_taxes_value: '4,79'

    })
  }
}
